"""
chat_engine.py
==============
Manages the conversation logic for the AI Retail Assistant.
Uses the modern google-genai SDK and DuckDB to execute read-only queries
directly against the Gold analytics layer and return verified data.
"""

import os
import re
import json
import logging
from typing import Optional, Tuple, Any, List, Dict
import duckdb
import pandas as pd
from dotenv import load_dotenv

# Set up logger
logger = logging.getLogger("chat_engine")
logger.setLevel(logging.INFO)

# Load environment variables
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
load_dotenv(os.path.join(ROOT_DIR, ".env"))

GOLD_DIR = os.path.join(ROOT_DIR, "data", "gold")
ANALYTICS_DIR = os.path.join(ROOT_DIR, "data", "analytics")

FORBIDDEN_SQL_PATTERN = re.compile(
    r"\b(DROP|DELETE|UPDATE|INSERT|ATTACH|DETACH|COPY|PRAGMA|ALTER|CREATE|EXEC|EXECUTE|EXPORT|CALL|VACUUM|LOAD)\b",
    re.IGNORECASE,
)

FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"]


def _format_cell_value(val: Any) -> Any:
    """Format DataFrame values safely for JSON serialization."""
    if val is None or pd.isna(val):
        return None
    if isinstance(val, (pd.Timestamp,)):
        return val.isoformat()
    if isinstance(val, float):
        if val.is_integer():
            return int(val)
        return round(val, 2)
    if hasattr(val, "item"):
        return val.item()
    return val


class ChatEngine:
    """
    Business Intelligence Assistant powered by google-genai and DuckDB.
    Initialized lazily so missing keys or data do not crash API startup.
    """

    def __init__(self):
        self._con: Optional[duckdb.DuckDBPyConnection] = None
        self._schema_text: Optional[str] = None
        self._tables_registered: bool = False

    def is_data_available(self) -> bool:
        """Check if required Gold parquet files exist."""
        fact_path = os.path.join(GOLD_DIR, "fact_sales.parquet")
        return os.path.exists(fact_path)

    def _init_duckdb(self) -> Tuple[bool, str]:
        """Lazy initialization of DuckDB in-memory views over Gold parquet tables."""
        if self._tables_registered and self._con is not None:
            return True, ""

        if not self.is_data_available():
            return False, (
                "Analytics Gold data is missing. Please run 'scripts/generation.sh', "
                "'scripts/ingestion.sh', and 'scripts/transform.sh' to generate required data."
            )

        try:
            con = duckdb.connect(":memory:")
            tables = ["fact_sales", "dim_date", "dim_product", "dim_store", "dim_customer"]
            schema_lines = []

            for tbl in tables:
                p = os.path.join(GOLD_DIR, f"{tbl}.parquet")
                if os.path.exists(p):
                    con.execute(f"CREATE VIEW {tbl} AS SELECT * FROM '{p}'")
                    cols = con.execute(f"DESCRIBE {tbl}").fetchall()
                    col_str = ", ".join([f"{c[0]} ({c[1]})" for c in cols])
                    schema_lines.append(f"Table {tbl}:\n  Columns: {col_str}")

            self._con = con
            self._schema_text = "\n".join(schema_lines)
            self._tables_registered = True
            return True, ""
        except Exception as e:
            logger.exception("Failed to initialize DuckDB Gold views: %s", e)
            return False, f"Failed to initialize database engine: {str(e)}"

    def _validate_sql(self, sql_query: str) -> Tuple[str, Optional[str]]:
        """
        Validate that the query is read-only, single statement, and enforce LIMIT <= 200.
        """
        cleaned = sql_query.strip().strip(";")
        if not cleaned:
            return "", "Empty SQL query."

        # Reject multiple statements (semicolon outside quotes)
        statements = [s.strip() for s in cleaned.split(";") if s.strip()]
        if len(statements) > 1:
            return "", "Multiple SQL statements are not permitted."

        query = statements[0]

        # Must start with SELECT or WITH
        if not re.match(r"^(SELECT|WITH)\b", query, re.IGNORECASE):
            return "", "Only SELECT or WITH queries are allowed."

        # Check for forbidden mutation or administration keywords
        forbidden_match = FORBIDDEN_SQL_PATTERN.search(query)
        if forbidden_match:
            return "", f"Forbidden SQL keyword '{forbidden_match.group(1)}' detected."

        # Enforce LIMIT <= 200
        limit_match = re.search(r"\bLIMIT\s+(\d+)", query, re.IGNORECASE)
        if limit_match:
            limit_val = int(limit_match.group(1))
            if limit_val > 200 or limit_val <= 0:
                query = query[: limit_match.start(1)] + "200" + query[limit_match.end(1) :]
        else:
            query = f"{query} LIMIT 200"

        return query, None

    def _execute_sql(self, sql: str) -> Tuple[Optional[pd.DataFrame], Optional[str]]:
        """Execute validated query against DuckDB read-only views."""
        if not self._con:
            ok, err = self._init_duckdb()
            if not ok:
                return None, err

        try:
            df = self._con.execute(sql).df()
            return df, None
        except Exception as e:
            logger.warning("DuckDB query failed: %s | SQL: %s", e, sql)
            return None, str(e)

    def _build_data_structures(
        self, df: pd.DataFrame, suggested_type: str = "table"
    ) -> Tuple[Optional[Dict[str, Any]], Optional[List[Dict[str, Any]]], str]:
        """Convert DuckDB DataFrame results to tableData and chartData."""
        if df.empty:
            return {"headers": list(df.columns), "rows": []}, None, "table"

        # 1. tableData
        headers = list(df.columns)
        rows = [
            [_format_cell_value(val) for val in row]
            for row in df.itertuples(index=False)
        ]
        table_data = {"headers": headers, "rows": rows}

        # 2. chartData
        chart_data: Optional[List[Dict[str, Any]]] = None
        data_type = suggested_type or "table"

        if len(df.columns) >= 2:
            # Locate label column and numeric metric column
            label_col = None
            metric_col = None

            for col in df.columns:
                if not label_col and (
                    pd.api.types.is_string_dtype(df[col])
                    or pd.api.types.is_object_dtype(df[col])
                    or pd.api.types.is_datetime64_any_dtype(df[col])
                ):
                    label_col = col
                elif not metric_col and pd.api.types.is_numeric_dtype(df[col]):
                    metric_col = col

            if not label_col:
                label_col = df.columns[0]
            if not metric_col and len(df.columns) > 1:
                metric_col = df.columns[1]

            if label_col and metric_col and pd.api.types.is_numeric_dtype(df[metric_col]):
                top_slice = df.head(15)
                chart_data = []
                for _, r in top_slice.iterrows():
                    val = r[metric_col]
                    val_num = round(float(val), 2) if pd.notna(val) else 0.0
                    name_str = str(r[label_col]) if pd.notna(r[label_col]) else "Unknown"
                    chart_data.append({"name": name_str, "value": val_num})
                data_type = "chart"

        return table_data, chart_data, data_type

    def _parse_json_defensively(self, text: str) -> Dict[str, Any]:
        """Strip markdown fences and defensively parse structured JSON."""
        clean = text.strip()
        if "```json" in clean:
            clean = clean.split("```json", 1)[1].split("```", 1)[0].strip()
        elif "```" in clean:
            clean = clean.split("```", 1)[1].split("```", 1)[0].strip()

        try:
            parsed = json.loads(clean)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            # Fall back to finding first { and last }
            start = clean.find("{")
            end = clean.rfind("}")
            if start != -1 and end != -1 and end > start:
                try:
                    parsed = json.loads(clean[start : end + 1])
                    if isinstance(parsed, dict):
                        return parsed
                except Exception:
                    pass

        # Complete fallback
        return {
            "text": text.strip(),
            "sqlQuery": None,
            "data_type": "text",
            "chartData": None,
            "tableData": None,
        }

    def ask(
        self, user_query: str, history: Optional[List[Dict[str, Any]]] = None
    ) -> Tuple[Dict[str, Any], Optional[str], int]:
        """
        Processes question through Gemini and DuckDB Gold layer.
        Returns (response_dict, error_code, http_status).
        """
        # 1. Check data presence
        if not self.is_data_available():
            err_msg = (
                "Analytics Gold data is missing. Please run 'scripts/generation.sh', "
                "'scripts/ingestion.sh', and 'scripts/transform.sh' to populate Gold analytics data."
            )
            return {"error": err_msg, "code": "NO_DATA"}, "NO_DATA", 503

        # 2. Check API key presence
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            err_msg = "Gemini API key is not configured. Please set GEMINI_API_KEY in your environment."
            return {"error": err_msg, "code": "NO_API_KEY"}, "NO_API_KEY", 503

        # 3. Ensure DuckDB initialized
        ok, db_err = self._init_duckdb()
        if not ok:
            return {"error": db_err, "code": "NO_DATA"}, "NO_DATA", 503

        # 4. Import modern google-genai SDK
        try:
            from google import genai
            from google.genai import types
        except ImportError as e:
            logger.exception("google-genai SDK not installed: %s", e)
            return {
                "error": "google-genai SDK is not installed on the server.",
                "code": "MODEL_ERROR",
            }, "MODEL_ERROR", 503

        # 5. Build system prompt
        system_instruction = f"""You are the Retail Data Hub SQL Architect and Executive Business Intelligence Consultant.
You analyze retail data by writing DuckDB SQL queries against the Gold layer star schema and explaining the results.

GOLD LAYER DUCKDB SCHEMA:
{self._schema_text}

SCHEMA RELATIONSHIPS:
- fact_sales.product_sk -> dim_product.product_sk
- fact_sales.store_sk -> dim_store.store_sk
- fact_sales.customer_sk -> dim_customer.customer_sk
- fact_sales.date_key -> dim_date.date_key
- For current customer records, filter by `dim_customer.is_current = true`.

QUERY RULES:
1. Generate valid, read-only DuckDB SQL for the user's question.
2. The query MUST be a single SELECT or WITH...SELECT statement.
3. Reference tables directly: `fact_sales`, `dim_product`, `dim_store`, `dim_customer`, `dim_date` (no database prefix).
4. Always use appropriate aggregation, GROUP BY, and ORDER BY clauses.
5. The query MUST include a LIMIT clause (maximum 200).
6. Return a JSON object matching this schema:
{{
  "text": "Executive explanation and analytical insights in clean Markdown.",
  "sqlQuery": "SELECT ... FROM fact_sales ... LIMIT 10;",
  "data_type": "table" | "chart" | "text"
}}"""

        # 6. Build conversation contents (keeping last 6 turns)
        contents = []
        if history:
            for item in history[-6:]:
                sender = item.get("role") or item.get("sender") or "user"
                role = "user" if sender in ("user", "human") else "model"
                text = item.get("text") or item.get("message") or item.get("content") or ""
                if text.strip():
                    contents.append(
                        types.Content(
                            role=role,
                            parts=[types.Part.from_text(text=text.strip())],
                        )
                    )

        # Append current user question
        contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=user_query.strip())],
            )
        )

        # 7. Model selection with fallback
        chosen_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
        models_to_try = [chosen_model]
        for m in FALLBACK_MODELS:
            if m not in models_to_try:
                models_to_try.append(m)

        client = genai.Client(api_key=api_key)
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            temperature=0.2,
        )

        last_error_code = "MODEL_ERROR"
        last_error_message = ""
        parsed_response = None
        active_model = ""

        for model_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config,
                )
                if response and response.text:
                    parsed_response = self._parse_json_defensively(response.text)
                    active_model = model_name
                    logger.info("Successfully received Gemini response from %s", model_name)
                    break
            except Exception as e:
                err_str = str(e)
                logger.warning("Attempt with model %s failed: %s", model_name, err_str)
                last_error_message = err_str
                if "429" in err_str or "ResourceExhausted" in err_str or "quota" in err_str.lower():
                    last_error_code = "RATE_LIMIT"
                else:
                    last_error_code = "MODEL_ERROR"

        if not parsed_response:
            return {
                "error": f"Gemini API request failed: {last_error_message}",
                "code": last_error_code,
            }, last_error_code, 503

        # 8. Real SQL Execution and Repair
        sql_query = parsed_response.get("sqlQuery")
        if sql_query:
            valid_sql, val_err = self._validate_sql(sql_query)
            if val_err:
                logger.warning("Generated SQL failed validation: %s", val_err)
                parsed_response["sqlQuery"] = None
                parsed_response["tableData"] = None
                parsed_response["chartData"] = None
            else:
                # Execute in DuckDB
                df, sql_err = self._execute_sql(valid_sql)

                # If failed, attempt repair once with Gemini
                if sql_err:
                    logger.info("SQL execution error: %s. Asking Gemini for repair...", sql_err)
                    try:
                        repair_prompt = (
                            f"The SQL query you generated:\n{valid_sql}\n"
                            f"Failed execution with DuckDB error:\n{sql_err}\n"
                            f"Please fix the SQL query using the Gold layer column names and return the corrected JSON object."
                        )
                        repair_contents = list(contents)
                        repair_contents.append(
                            types.Content(
                                role="model",
                                parts=[types.Part.from_text(text=json.dumps(parsed_response))],
                            )
                        )
                        repair_contents.append(
                            types.Content(
                                role="user",
                                parts=[types.Part.from_text(text=repair_prompt)],
                            )
                        )

                        repair_res = client.models.generate_content(
                            model=active_model,
                            contents=repair_contents,
                            config=config,
                        )
                        if repair_res and repair_res.text:
                            repaired_json = self._parse_json_defensively(repair_res.text)
                            repaired_sql = repaired_json.get("sqlQuery")
                            if repaired_sql:
                                rep_valid_sql, rep_val_err = self._validate_sql(repaired_sql)
                                if not rep_val_err:
                                    rep_df, rep_err = self._execute_sql(rep_valid_sql)
                                    if rep_df is not None:
                                        df = rep_df
                                        valid_sql = rep_valid_sql
                                        parsed_response["text"] = repaired_json.get(
                                            "text", parsed_response.get("text")
                                        )
                    except Exception as rep_e:
                        logger.warning("SQL repair attempt encountered error: %s", rep_e)

                # Build real tableData and chartData from the query results
                if df is not None:
                    suggested_type = parsed_response.get("data_type", "table")
                    table_data, chart_data, final_data_type = self._build_data_structures(
                        df, suggested_type
                    )
                    parsed_response["sqlQuery"] = valid_sql
                    parsed_response["tableData"] = table_data
                    parsed_response["chartData"] = chart_data
                    parsed_response["data_type"] = final_data_type
                else:
                    parsed_response["tableData"] = None
                    parsed_response["chartData"] = None
                    parsed_response["data_type"] = "text"

        return parsed_response, None, 200


# Singleton engine instance
engine = ChatEngine()

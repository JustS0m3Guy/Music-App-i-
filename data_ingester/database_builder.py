"""
Simple CSV -> SQLite loader for app_games.csv

Usage:
  python database_builder.py \
    --csv /home/terminator/Documents/Music-App-i-/data_ingester/app_games.csv \
    --sqlite /home/terminator/Documents/Music-App-i-/data_ingester/app_games.db

By default it will create (if needed) a table named `games` and insert rows skipping the CSV header.
"""
import argparse
import csv
import sqlite3
from pathlib import Path
from typing import Iterable

DEFAULT_CSV = Path(__file__).resolve().parent / "app_games.csv"
DEFAULT_DB = Path(__file__).resolve().parent / "../django-app/db.sqlite3"
TABLE_NAME = "app_games"

INSERT_SQL = f"""
INSERT OR REPLACE INTO {TABLE_NAME}
(gameID, title, studio, releaseYear, rating, genre)
VALUES (?, ?, ?, ?, ?, ?);
"""


def normalize_fields(fields: Iterable[str]) -> list:
    # remove surrounding quotes and trim whitespace for each field
    return [f.strip().strip('"').strip() if f is not None else None for f in fields]


def row_to_typed_tuple(cols: list):
    # expected order: gameID,title,studio,releaseYear,rating,genre
    if len(cols) < 6:
        # pad missing columns with None
        cols = cols + [None] * (6 - len(cols))
    game_id = None
    try:
        game_id = int(cols[0]) if cols[0] != "" else None
    except Exception:
        game_id = None

    title = cols[1] or ""
    studio = cols[2] or ""
    try:
        year = int(cols[3]) if cols[3] != "" else None
    except Exception:
        year = None
    try:
        rating = float(cols[4]) if cols[4] != "" else None
    except Exception:
        rating = None
    genre = cols[5] or ""

    return (game_id, title, studio, year, rating, genre)


def import_csv_to_sqlite(csv_path: Path, sqlite_path: Path, table_name: str = TABLE_NAME):
    csv_path = Path(csv_path)
    sqlite_path = Path(sqlite_path)

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    conn = sqlite3.connect(str(sqlite_path), isolation_level=None)
    cur = conn.cursor()
    try:
        inserted = 0
        with csv_path.open(newline="", encoding="utf-8") as fh:
            reader = csv.reader(fh)
            # skip header (first line)
            header = next(reader, None)
            for raw_row in reader:
                # normalize (remove quotes) then convert types
                cols = normalize_fields(raw_row)
                vals = row_to_typed_tuple(cols)
                # if gameID is None, skip row (no primary key)
                if vals[0] is None:
                    # still allow insertion with NULL id? we skip to be safe
                    continue
                cur.execute(INSERT_SQL, vals)
                inserted += 1
        conn.commit()
        print(f"Imported {inserted} rows into {sqlite_path} (table: {table_name}).")
    finally:
        conn.close()


def main():
    p = argparse.ArgumentParser(description="Import CSV into SQLite (removes surrounding quotes).")
    p.add_argument("--csv", "-c", type=Path, default=DEFAULT_CSV, help="Path to CSV file")
    p.add_argument("--sqlite", "-s", type=Path, default=DEFAULT_DB, help="Path to SQLite DB file to create/use")
    args = p.parse_args()
    import_csv_to_sqlite(args.csv, args.sqlite)


if __name__ == "__main__":
    main()
import argparse
import csv
import sqlite3
from pathlib import Path
from typing import Iterable

DEFAULT_CSV = Path(__file__).resolve().parent / "app_songs.csv"
DEFAULT_DB = Path(__file__).resolve().parent / "../django-app/db.sqlite3"
TABLE_NAME = "app_songs"

CREATE_TABLE_SQL = f"""
CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
    songID INTEGER PRIMARY KEY,
    songName TEXT,
    gameID_id INTEGER,
    length INTEGER,
    videoURL TEXT,
    imageURL TEXT
);
"""

INSERT_SQL = f"""
INSERT OR REPLACE INTO {TABLE_NAME}
(songID, songName, gameID_id, length, videoURL, imageURL)
VALUES (?, ?, ?, ?, ?, ?);
"""


def normalize_fields(fields: Iterable[str]) -> list:
    # remove surrounding quotes and trim whitespace for each field
    return [f.strip().strip('"').strip() if f is not None else None for f in fields]


def row_to_typed_tuple(cols: list):
    # expected order: songID,songName,gameID_id,length,videoURL,imageURL
    if len(cols) < 6:
        cols = cols + [None] * (6 - len(cols))
    song_id = None
    try:
        song_id = int(cols[0]) if cols[0] != "" else None
    except Exception:
        song_id = None

    song_name = cols[1] or ""
    try:
        game_id = int(cols[2]) if cols[2] != "" else None
    except Exception:
        game_id = None
    try:
        length = int(cols[3]) if cols[3] != "" else None
    except Exception:
        length = None
    video = cols[4] or ""
    image = cols[5] or ""

    return (song_id, song_name, game_id, length, video, image)


def import_csv_to_sqlite(csv_path: Path, sqlite_path: Path, table_name: str = TABLE_NAME):
    csv_path = Path(csv_path)
    sqlite_path = Path(sqlite_path)

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    conn = sqlite3.connect(str(sqlite_path), isolation_level=None)
    cur = conn.cursor()
    try:
        # ensure table exists
        cur.executescript(CREATE_TABLE_SQL)
        inserted = 0
        with csv_path.open(newline="", encoding="utf-8") as fh:
            reader = csv.reader(fh)
            # skip header (first line)
            header = next(reader, None)
            for raw_row in reader:
                # normalize (remove quotes) then convert types
                cols = normalize_fields(raw_row)
                vals = row_to_typed_tuple(cols)
                # if songID is None, skip row
                if vals[0] is None:
                    continue
                cur.execute(INSERT_SQL, vals)
                inserted += 1
        conn.commit()
        print(f"Imported {inserted} rows into {sqlite_path} (table: {table_name}).")
    finally:
        conn.close()


def main():
    p = argparse.ArgumentParser(description="Import songs CSV into SQLite (removes surrounding quotes).")
    p.add_argument("--csv", "-c", type=Path, default=DEFAULT_CSV, help="Path to CSV file")
    p.add_argument("--sqlite", "-s", type=Path, default=DEFAULT_DB, help="Path to SQLite DB file to create/use")
    args = p.parse_args()
    import_csv_to_sqlite(args.csv, args.sqlite)


if __name__ == "__main__":
    main()
# ...existing code...
import argparse
import csv
import sqlite3
from pathlib import Path
import time 
from typing import Iterable

DEFAULT_DB = Path(__file__).resolve().parent / "../django-app/db.sqlite3"
TABLE_NAME = "app_songs"

INSERT_SQL = f"""
INSERT OR REPLACE INTO {TABLE_NAME}
(songName, gameID_id, length, videoURL, imageURL)
VALUES (?, ?, ?, ?, ?);
"""


def normalize_fields(fields: Iterable[str]) -> list:
    # remove surrounding quotes and trim whitespace for each field
    return [f.strip().strip('"').strip() if f is not None else None for f in fields]


def row_to_typed_tuple(cols: list, game: int =0):
    # expected order: songID,songName,gameID_id,length,videoURL,imageURL
    if len(cols) < 5:
        cols = cols + [None] * (5 - len(cols))
    song_name = cols[0] or ""
    length = time.strptime(cols[1], '%M:%S')

    video = cols[2] or ""
    image = ""
    return (song_name, game, ((length.tm_min *60) +length.tm_sec)*(10**6), video, image)


def import_csv_to_sqlite(csv_path: Path, sqlite_path: Path, table_name: str = TABLE_NAME, game_id: int = 0):
    csv_path = Path(csv_path)
    sqlite_path = Path(sqlite_path)

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    conn = sqlite3.connect(str(sqlite_path), isolation_level=None)
    cur = conn.cursor()
    try:
        # ensure table exists
        inserted = 0
        with csv_path.open(newline="", encoding="utf-8") as fh:
            reader = csv.reader(fh)
            # skip header (first line)
            header = next(reader, None)
            for raw_row in reader:
                # normalize (remove quotes) then convert types
                cols = normalize_fields(raw_row)
                vals = row_to_typed_tuple(cols, game_id)
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
    p.add_argument("--csv", "-c", type=Path, required=True, help="Path to CSV file")
    p.add_argument("--sqlite", "-s", type=Path, default=DEFAULT_DB, help="Path to SQLite DB file to create/use")
    p.add_argument("--game-id", "-g", type=int, required=True, help="Game ID to associate with all songs in the CSV")
    args = p.parse_args()
    import_csv_to_sqlite(args.csv, args.sqlite, game_id=args.game_id)


if __name__ == "__main__":
    main()
# ...existing code...
import os
import time


with open('data_ingester/Overwatch2.csv', 'r') as file:
    next(file)  # Skip header line
    for line in file.readlines():
        song_data = line.strip().split(',')
        song_name = song_data[0]
        length = time.strptime(song_data[1], '%M:%S')
        video_url = song_data[2]
        os.system(f"docker exec model_db mysql -u root -prootpassword -e 'connect mydb; "+
                  f"INSERT INTO app_songs (songName, gameID_id, videoURL, length) VALUES (\"{song_name}\", 26, \"{video_url}\", {((length.tm_min *60) +length.tm_sec)*(10**6)});'")

def checkBadges(currentuser):
    from django.db.models import Count
    from .models import Songs, FavSongs, UserBadges
    from django.db import connection
    
    # with connection.cursor() as curr:
    #     liked_songs = curr.execute(
    #         "select Count(*) from ( select Count(gameID_id) from app_songs as s join app_games as g on s.gameID_id=g.gameID where songID in (select songID_id from app_favsongs where userID_id =2)group by gameID);"
    #     )
    #     if (liked_songs.()[0]) > 4:
    #         UserBadges.objects.get_or_create(userID=currentuser, badgeTypeID_id=4)
    if (
    Songs.objects
            .filter(songID__in=FavSongs.objects.filter(userID=currentuser).values('songID'))
            .values('gameID', 'gameID__title')
            .annotate(fav_song_count=Count('songID'))
            .order_by('-fav_song_count')
    ).count() > 4:
        UserBadges.objects.get_or_create(userID=currentuser, badgeTypeID_id=4)
    
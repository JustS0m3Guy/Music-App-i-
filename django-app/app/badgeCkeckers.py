from django.db.models import Count, Q, F
from .models import Songs, FavSongs, UserBadges
from django.db import connection
from django.utils import timezone

def checkBadges(currentuser):

# select Count(*) from ( select Count(gameID_id) from app_songs as s join app_games as g on s.gameID_id=g.gameID 
# where songID in (select songID_id from app_favsongs where userID_id =2)group by gameID);
    if (
    Songs.objects
            .filter(songID__in=FavSongs.objects.filter(userID=currentuser).values('songID'))
            .values('gameID', 'gameID__title')
            .annotate(fav_song_count=Count('songID'))
            .order_by('-fav_song_count')
    ).count() > 4:
        UserBadges.objects.get_or_create(userID=currentuser, badgeTypeID_id=4)

    if (timezone.now() - currentuser.date_joined).days > 7:
        UserBadges.objects.get_or_create(userID=currentuser, badgeTypeID_id=5)
    
    if (timezone.now() - currentuser.date_joined).days > 365:
        UserBadges.objects.get_or_create(userID=currentuser, badgeTypeID_id=6)
    
    if (Songs.objects
             .values('gameID', 'gameID__title')
             .annotate(
                 total_songs=Count('songID', distinct=True),
                 fav_songs=Count('songID', filter=Q(songID__in=FavSongs.objects.filter(userID=currentuser).values('songID')), distinct=True)
             )
             .filter(total_songs=F('fav_songs'))):
        UserBadges.objects.get_or_create(userID=currentuser, badgeTypeID_id=8)


    
    
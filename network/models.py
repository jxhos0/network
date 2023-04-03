from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    first_name  = models.TextField(max_length=32)
    last_name   = models.TextField(max_length=32) 
    profile_img = models.ImageField(null=True, blank=True, default=None, upload_to="images/")

    
class Follower(models.Model):
    follower    = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follower")
    following   = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following")

    def __str__(self):
        return f"{self.follower} follows {self.following}"
    

class Post(models.Model):
    user                = models.ForeignKey(User, on_delete=models.CASCADE, related_name="poster")
    content             = models.TextField(max_length=300)
    timestamp           = models.DateTimeField(auto_now_add=True)
    updatedtimestamp    = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f'"{self.content[:15] + "..."}" posted by {self.user}'
    
    def serialize(self, currentUserID):

        imgURL          = self.user.profile_img.url if self.user.profile_img else None
        liked           = True if Like.objects.filter(post=self, user=currentUserID) else False
        userpost        = True if self.user.id == currentUserID else False
        userfollowed    = True if Follower.objects.filter(follower=currentUserID, following=self.user) else False
        timestamp       = f'editted {self.updatedtimestamp.strftime("%Y/%m/%d, %H:%M:%S")}' if self.updatedtimestamp else self.timestamp.strftime("%Y/%m/%d, %H:%M:%S")

        return {
            "id"                : self.id,
            "user"              : self.user.username,
            "content"           : self.content,
            "timestamp"         : timestamp,
            "poster_img"        : imgURL,
            "likes"             : Like.objects.filter(post=self).count(),
            "liked"             : liked,
            "userpost"          : userpost,
            "userfollowed"      : userfollowed
        }
    
class Like(models.Model):
    post        = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="liked_post")
    user        = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    timestamp   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.post} is liked by {self.user}"


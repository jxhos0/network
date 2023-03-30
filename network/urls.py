
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("<str:user>", views.profileView, name="profileview"),
    path("post/newpost", views.newPost, name="newpost"),
    


    path("posts/<str:profile>", views.load_posts, name="load_posts"),
    path("post/<int:post_id>", views.postData, name="post"),
    # path("")
]
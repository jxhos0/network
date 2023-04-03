import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.utils import timezone
from django.core.paginator import Paginator
from django.shortcuts import redirect

from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

from .models import *
from.forms import NewPostForm


def index(request):

    return render(request, "network/index.html", {
        "newPostForm" : NewPostForm(initial={"user" : request.user})
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        first_name = request.POST["first_name"]
        last_name = request.POST["last_name"]
        if request.FILES.get("profile_img") != None:
            profile_img = request.FILES["profile_img"]
        else:
            profile_img = None

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username=username, 
                                            email=email, 
                                            password=password, 
                                            first_name=first_name, 
                                            last_name=last_name, 
                                            profile_img=profile_img
                                            )
            user.save()
          
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

def newPost(request):
    # Check for form submission
    if request.method == "POST":

        # Fill form with user entries
        form = NewPostForm(request.POST or None, request.FILES or None)

        # print(form)

        # Check fields are valid and required fields have data
        if form.is_valid():
            form.save()    # Save the form data in database

            # Redirect user to index page
            return HttpResponseRedirect(reverse("index"))
        
        # Return user to create page with error message
        else:
            return render(request, "auctions/index.html", {
                "newPostForm" : form
            })  


def profileView(request, user):
    
    profileUser = User.objects.get(username=user)

    if request.method == "GET":
        followers = Follower.objects.filter(following=profileUser.id)
        following = Follower.objects.filter(follower=profileUser.id)
        if request.user.is_authenticated == True and Follower.objects.filter(follower=request.user, following=profileUser.id):
            followed_button_value = "Following"
        else:
            followed_button_value = "Follow"
        return render(request, "network/profile.html", {
            "currentUser" : request.user,
            "profileUser" : profileUser,
            "followers" : followers,
            "following" : following,
            "followed_button_value" : followed_button_value
        })
    
    elif request.method == "PUT":
        if request.user.is_authenticated:
            data = json.loads(request.body)
            if data.get("followed") == "Follow":
                Follower.objects.create(follower=request.user, following=profileUser).save()
            elif data.get("followed") == "Following":
                Follower.objects.get(follower=request.user, following=profileUser.id).delete()
            return HttpResponse(status=204)
        else:
            return JsonResponse({"error": "You are not logged in."}, status=401)


def postData(request, post_id):

    if request.user.is_authenticated:
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found."}, status=404)

        if request.method == "PUT":

            likes = Like.objects.filter(post=post_id, user=request.user)

            if likes:
                likes.delete()
            else:
                Like.objects.create(post=post, user=request.user).save()
    
            return HttpResponse(status=204)
        elif request.method == "POST":
            data=json.loads(request.body)
            
            if data.get('process') == 'edit':
                Post.objects.filter(pk=post_id).update(content=data.get('updated_post_text'), updatedtimestamp=timezone.now())
                return HttpResponse(status=204)
            
            elif data.get('process') == 'delete':
                Post.objects.filter(pk=post_id).delete()
                return HttpResponse(status=204)

        else:
            return JsonResponse({
                "error": "PUT or POST request required."
            }, status=400)
    else:
        return JsonResponse({"error": "You are not logged in."}, status=401)
    

def load_posts(request, profile):

    if profile != 'no-profile':
        profileUser = User.objects.get(username=profile)

    filter = request.GET.get('filter')

    if profile == 'no-profile' or filter == "all-posts" or filter == '':
        posts = Post.objects.all()
    elif filter == "following":
        followed_profiles = Follower.objects.filter(follower = request.user).values("following")
        posts = Post.objects.filter(user__in=followed_profiles)

    elif filter == "profile-posts":
        posts = Post.objects.filter(user=profileUser)

    # elif filter == "profile-comments":

    elif filter == "profile-likes":
        liked_posts = Like.objects.filter(user=profileUser).values("post")
        posts = Post.objects.filter(pk__in=liked_posts)

    posts = posts.order_by("-timestamp")

    paginator = Paginator(posts, 4)

    page_number = request.GET.get('page')
    posts = paginator.get_page(page_number)


    return JsonResponse({"posts" : [post.serialize(request.user.id) for post in posts], "number_pages" : paginator.num_pages}, safe=False)

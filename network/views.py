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
    # Load new post form into index page
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
    # Get the profile user from the User database
    profileUser = User.objects.get(username=user)

    # Check if request is retrieving or editting database
    if request.method == "GET":
        # Get lists of profiles following and followed for the profile user
        followers = Follower.objects.filter(following=profileUser.id)
        following = Follower.objects.filter(follower=profileUser.id)

        # Show a follow button for logged in users based on if they are already following the profile
        if request.user.is_authenticated == True and Follower.objects.filter(follower=request.user, following=profileUser.id):
            # If user is logged in and follows the profile set followed button status to Following
            followed_button_value = "Following"
        else:
            # If user is not logged in and follows the profile set followed button status to Follow
            followed_button_value = "Follow"

        # Load profile page with profile data excluding the posts.
        return render(request, "network/profile.html", {
            "currentUser" : request.user,
            "profileUser" : profileUser,
            "followers" : followers,
            "following" : following,
            "followed_button_value" : followed_button_value
        })
    
    elif request.method == "PUT":
        # Check user is logged in before allowing them to follow a profile
        if request.user.is_authenticated:
            # Get data from Javascript fetch API
            data = json.loads(request.body)

            # If profile is not followed, add a Follower object with the user and profile.
            if data.get("followed") == "Follow":
                Follower.objects.create(follower=request.user, following=profileUser).save()
            
            # If the profile is already followed, retrieve the Follower object entry and delete it.
            elif data.get("followed") == "Following":
                Follower.objects.get(follower=request.user, following=profileUser.id).delete()
            return HttpResponse(status=204)
        
        # If the user is not logged in pass an error back to the web page stating there was an authentication error.
        else:
            return JsonResponse({"error": "You are not logged in."}, status=401)

def postData(request, post_id):
    # Check the user is logged in before running any script
    if request.user.is_authenticated:

        # Try get the post data from the database
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found."}, status=404)

        if request.method == "PUT":
            # Check entry in database for this post and user
            likes = Like.objects.filter(post=post_id, user=request.user)

            # If user already likes the post, delete the database entry
            if likes:
                likes.delete()

            # If user does not like the post, create a new entry and save to database.
            else:
                Like.objects.create(post=post, user=request.user).save()
    
            return HttpResponse(status=204)
        
        elif request.method == "POST":
            # Get data from Javascript fetch API
            data=json.loads(request.body)
            
            # Check from the fetch data if post is being editted or deleted.
            if data.get('process') == 'edit':
                # Get database object for the post and update the content field, while setting an updated timestamp.
                Post.objects.filter(pk=post_id).update(content=data.get('updated_post_text'), updatedtimestamp=timezone.now())
                return HttpResponse(status=204)
            
            elif data.get('process') == 'delete':
                # Get database object for the post and delete it.
                Post.objects.filter(pk=post_id).delete()
                return HttpResponse(status=204)

        else:
            return JsonResponse({
                "error": "PUT or POST request required."
            }, status=400)
        
    # If the user is not logged in pass an error back to the web page stating there was an authentication error.
    else:
        return JsonResponse({"error": "You are not logged in."}, status=401)
    
def load_posts(request, profile):
    # Set the profile user and filter variables from the data parsed into the server
    # If not the index page (profile is set to 'index'), get the users data from the database.
    if profile != 'index':
        profileUser = User.objects.get(username=profile)

    filter = request.GET.get('filter')

    # If webpage is the index, return all posts.
    if profile == 'index' or filter == "all-posts" or filter == '':
        posts = Post.objects.all()

    # If request was for posts of profiles followed, return filtered list of posts liked by the user.
    elif filter == "following":
        followed_profiles = Follower.objects.filter(follower = request.user).values("following")    
        posts = Post.objects.filter(user__in=followed_profiles)    

    # If request was for a profile's posts, return list of posts by the profile.
    elif filter == "profile-posts":
        posts = Post.objects.filter(user=profileUser)   

    # If request was for posts a profile has commented on, return list of posts commented on by the user.
    elif filter == "profile-comments":
        posts_commented_on = Comment.objects.filter(user=profileUser).values("post")    
        posts = Post.objects.filter(pk__in=posts_commented_on)

    # If request was for posts a profile has liked, return list of posts liked by the user.
    elif filter == "profile-likes":
        liked_posts = Like.objects.filter(user=profileUser).values("post")
        posts = Post.objects.filter(pk__in=liked_posts)

    # Order the list in reverse chronological order 
    posts = posts.order_by("-timestamp")

    # Paginate the data
    paginator = Paginator(posts, 10)

    # Get the page number from the web page and load the posts from the paginated data
    page_number = request.GET.get('page')
    posts = paginator.get_page(page_number)

    # Return the data from the paginated data to the webpage as JSON format
    return JsonResponse({"posts" : [post.serialize(request.user.id) for post in posts], "number_pages" : paginator.num_pages}, safe=False)

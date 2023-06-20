# CS50w Project 4 - Network

This is my submission for the CS50w Network project

## Overview

Creating a social media website, inspiration was drawn from Twitter with the goal to create an imitation of it being set.

Users are able to view a list of posts by other users, create posts of their own, follow other accounts and comment on other posts.

User pages provide other users with the ability to follow each other, as well as viewing posts of that user and posts that user has liked or commented on.

A feature implemented on this imitation is the ability to be able to edit and delete your own posts.

## The Design

### Back-End

Django was implemented for the backend design to handle all database related aspects of the website including, users, posts, comments, post likes and follows. Clicking on a link, Django passes the required database information to the webpage to be rendered on the client side, while interactions on webpages are handled by JavaScripts fetch function to interact with the back end, completing POST, GET and PUT requests.

### Front-End

HTML and CSS was used for the front-end design of this website, with JavaScript being implemented to load JSON data on the client side of the server. JavaScript is responsible for users being able to like/comment on posts and follow users without page reloads, as it uses the DOM to modify relevant HTML elements.

Post lists are paginated, being limited to 10 posts per page, and user accounts can also be followed by interacting with the three dots to the right of the post.

## How to run the application
To run the app the only Python package not included in a standard Python install is Django.

To run the app please follow the below steps:

- Run your virtual environment (if using one)
- pip install -r requirements.txt (if you don't already have Django installed)
- python manage.py runserver

## Testing the Site

If you want to test the site yourself, the login form is alread prefilled out with a test account login details.

Should the form not be pre-populated use the following information:

User: test_account

Password: test_account

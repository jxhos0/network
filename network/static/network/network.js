document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in, if they are not set public user variable of anonymous
    try {
        current_user = document.querySelector('.current-user').innerHTML
    } catch (error) {
        current_user = 'anonymous'
    }

    // Check if user is on index page or a profile page
    if (document.getElementById('home-container')) {

        if (current_user !== 'anonymous') {
            // If the user is signed in
            // If the 'all posts' link is clicked trigger the load posts function and hide the selector div from 'following'
            document.querySelector('#all-posts').addEventListener('click', () => {
                document.querySelector('#all-posts .selector').className = 'selector'
                document.querySelector('#following .selector').className = 'selector hidden'
                load_posts(`${current_user}`, 'all-posts', 1)
            });
            // If the 'following' link is clicked trigger the load posts function and hide the selector div from 'all posts'
            document.querySelector('#following').addEventListener('click', () => {
                document.querySelector('#all-posts .selector').className = 'selector hidden'
                document.querySelector('#following .selector').className = 'selector'
                load_posts(`${current_user}`, 'following', 1)
            });

            // Disable/enable the new post submit button
            // Select the submit button and input to be used later
            const submit = document.querySelector('#submit');
            const newPost = document.querySelector('#id_content');

            // Disable submit button by default:
            submit.disabled = true;

            // Listen for input to be typed into the input field
            newPost.onkeyup = () => {
                if (newPost.value.length > 0) {
                    submit.disabled = false;
                } else {
                    submit.disabled = true;
                }
            }

            // By defualt load all posts
            load_posts(`${current_user}`, 'all-posts', 1)
        } else {
            // If the user is not logged in load all posts
            load_posts('index', 'all-posts', 1)
        }

    // If the user is on a profile page
    } else if (document.getElementById('profile-container')) {
        // Get the profile name from the HTML
        var profile = document.querySelector('.profile-user').innerHTML

        // If the 'posts' link is clicked trigger the load posts function and hide the selector div from other links
        document.querySelector('#profile-posts').addEventListener('click', () => {
            document.querySelector('#profile-posts .selector').className = 'selector'
            document.querySelector('#profile-comments .selector').className = 'selector hidden'
            document.querySelector('#profile-likes .selector').className = 'selector hidden'
            load_posts(`${profile}`, 'profile-posts', 1)
        });
        
        // If the 'comments' link is clicked trigger the load posts function and hide the selector div from other links
        document.querySelector('#profile-comments').addEventListener('click', () => {
            document.querySelector('#profile-posts .selector').className = 'selector hidden'
            document.querySelector('#profile-comments .selector').className = 'selector'
            document.querySelector('#profile-likes .selector').className = 'selector hidden'
            load_posts(`${profile}`, 'profile-comments', 1)
        });
        
        // If the 'likes' link is clicked trigger the load posts function and hide the selector div from other links
        document.querySelector('#profile-likes').addEventListener('click', () => {
            document.querySelector('#profile-posts .selector').className = 'selector hidden'
            document.querySelector('#profile-comments .selector').className = 'selector hidden'
            document.querySelector('#profile-likes .selector').className = 'selector '
            load_posts(`${profile}`, 'profile-likes', 1)
        });

        // Check if the Follow Button exists
        if (document.querySelector('#follow')) {
            // If the button exists run the follow toggle function when the button is clicked.
            document.querySelector('#follow').addEventListener('click', () => follow_toggle(profile, document.querySelector('.followed-value').innerHTML))
        }

        // By default load all profile posts
        load_posts(`${profile}`, 'profile-posts', 1)
    } 

    // Listen to the html page for clicks on any element
    document.querySelector("html").addEventListener("click", () => {
        // Check if there is a edit post popup
        if (document.querySelector('.is-active')) {
            // Check if the popup was just toggled
            if (event.target.closest(".post-options")) return;

            // Remove the popup if clicked out of
            document.querySelector('#popup').classList.remove("is-active")
        }
    })    
})

function load_posts(profile, filter, page) {
    // Reset the posts container data
    document.querySelector('.posts-container').innerHTML = ''
    
    // Fetch the data from the database parsing in the profile, post filter and pagination page
    fetch(`/posts/${profile}?filter=${filter}&page=${page}`)
    .then(response => response.json())
    .then(response => {

        // Set variables for pages and posts
        var current_page = Number(page)
        var number_pages = Number(response['number_pages'])
        var posts = response['posts']

        // Check there are posts in the list of posts
        if (posts.length > 0) {
            // Loop through each post
            posts.forEach(post => {

                // Create post row div and ID and classes
                const post_row = document.createElement('div');
                post_row.setAttribute('id', `post-${post.id}`)
                post_row.classList.add('post-container');

                // Set constant variables based on conditional statements
                const image_html = post.poster_img ? `<img src="${ post.poster_img }" height="48px" width="48px" class="profile-img">` : `<div class="no-profile-img"><h4>${ post.user["0"].toUpperCase() }</h4></div>`
                const likes = post.likes > 0 ? post.likes : ''
                const liked = post.liked ? 'liked' : 'like'
                const likedSVG = post.liked ? '<path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>' : '<path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>'
                
                // Create the HTML for the post row
                post_row.innerHTML = `
                    <div class="profile-pic">
                        ${image_html}
                    </div>
                    <div class="post-content">
                        <div class="post-head">
                            <div class="post-details">
                                <b><a id="userprofile" href="${ post.user }">${ post.user }</a></b> ${ post.timestamp }
                            </div>
                            <div class="post-options" onclick="postOptions(${post.id}, '${ post.user }', ${post.userpost}, ${post.userfollowed}, '${filter}', '${current_page}')">&#8226;&#8226;&#8226;</div>
                        </div>
                        <div class="post-text">${ post.content }</div>
                        <div class="post-responses span-3-col">
                            <div class="${liked}" onclick="like_toggle(${post.id}, '${profile}', '${filter}', '${current_page}')">
                                <div class="${liked}-svg">
                                    <svg viewBox="0 0 24 24" height="1.15em">
                                        ${likedSVG}
                                    </svg>
                                </div>
                                <div>${likes}</div>
                            </div>
                            <div class="comment">
                                <div class="comment-svg">
                                    <svg viewBox="0 0 24 24" height="1.15em">
                                        <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
                                    </svg>
                                </div>
                            </div>
                            <div class="share">
                                <div class="share-svg">
                                    <svg viewBox="0 0 24 24" height="1.15em">
                                        <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    `

                // Add the post row to the posts container
                document.querySelector('.posts-container').append(post_row);
            })

            // Add pagination information if more than 1 page exists
            if (number_pages > 1) {
                // Create a div with class name for the pagination data
                const paginator = document.createElement('div');
                paginator.classList.add('paginator');

                // Insert HTML for the current page number and number of pages
                paginator.innerHTML = `<a class="page-link"><b>${current_page}</b>&ensp;&ensp;/&ensp;&ensp;<b>${number_pages}</b></a>`
                document.querySelector('.posts-container').append(paginator);
    
                // Check if on first page of data
                if (current_page === 1) {
                    // If on first page of data, disable and hide the previous and first buttons
                    document.querySelector('.paginator').insertAdjacentHTML("afterbegin", `
                    <a class="page-link hidden" disabled>&laquo; </a>
                    <a class="page-link hidden" disabled>&lt; </a>
                    `)
                } else {
                    // Show the first and previous buttons and allow them to be clicked
                    document.querySelector('.paginator').insertAdjacentHTML("afterbegin", `
                    <a class="page-link"  onclick="load_posts('${profile}', '${filter}', 1)">&laquo; </a>
                    <a class="page-link" onclick="load_posts('${profile}', '${filter}', '${current_page - 1}')">&lt; </a>
                    `)
                }
    
                // Check if on the last page
                if (current_page === number_pages) {
                    // If on last page of data, disable and hide the next and last buttons
                    document.querySelector('.paginator').insertAdjacentHTML("beforeend", `
                    <a class="page-link hidden" disabled> &gt;</a>
                    <a class="page-link hidden" disabled> &raquo;</a>
                    `)
                } else {
                    // Show the next and last buttons and allow them to be clicked
                    document.querySelector('.paginator').insertAdjacentHTML("beforeend", `
                    <a class="page-link" onclick="load_posts('${profile}', '${filter}', '${current_page + 1}')"> &gt;</a>
                    <a class="page-link" onclick="load_posts('${profile}', '${filter}', '${number_pages}')"> &raquo;</a>
                    `)
                }
            }
        // If only one page of posts is returned
        } else {
            // Create a div with class name for a no posts message
            const message = document.createElement('div');
            message.classList.add('no-posts-message');

            // Insert HTML for the message into the div
            message.innerHTML = `${profile} currently has no posts to view in this list.`
            document.querySelector('.posts-container').append(message);
        }
    })
}

function follow_toggle(profile, followed_value, filter, page) {
    // Check if user is the profile user, if so do nothing (this is more for if someone uses the developer console to run the function).
    if (current_user === profile) return;
    
    // Send data to the server with the new followed status, passing in the CSRF token
    fetch(`${profile}`, {
        method: 'PUT',
        headers: {'X-CSRFToken': getCookie('csrftoken')},
        mode: 'same-origin',
        body: JSON.stringify({
            followed : followed_value
        })
    })
    .then(function(response) {
        // Check for HTTP response
        if (response["status"] === 401)  {
            // If error 401 - unauthenticated user redirect to login page
            location.href = 'http://127.0.0.1:8000/login'
        } else if (response["status"] === 204) {
            // If HTTP response check if page was followed from profile or post list
            if (filter || page) {
                // If filter or page data available it means profile liked from post list. Reload that page of posts.
                load_posts(`${profile}`, `${filter}`, `${page}`)
            } else {
                // Else reload profile
                location.reload()
            }
        }
    })
}

function like_toggle(post_id, profile, filter, page) {
    // Send data to the server with the new liked status, passing in the CSRF token
    fetch(`post/${post_id}`, {
        method: 'PUT',
        headers: {'X-CSRFToken': getCookie('csrftoken')},
        mode: 'same-origin',
        body: JSON.stringify({
            id: post_id
        })
    })
    .then(function(response) {
        // Check for HTTP response
        if (response["status"] === 401)  {
            // If error 401 - unauthenticated user redirect to login page
            location.href = 'http://127.0.0.1:8000/login'
        } else if (response["status"] === 204) {
            // Reload list of posts from pagination data
            load_posts(`${profile}`, `${filter}`, `${page}`)
        }
    })
}

function postOptions(post_id, profile, userpost, userfollowed, filter, page) {
    // Check if post is from the user. If it is show "Edit" and "Delete" options, otherwise show the option to "Follow/Unfollow"
    if (userpost) {
        // Set the popup inner HTML to "Edit" and "Delete"
        document.querySelector('#popup').innerHTML = `
        <div onclick="editPost(${post_id})">Edit Post</div>
        <div style="color:red" onclick="deleteConfirmation(${post_id}, '${profile}', '${filter}', '${page}')">Delete Post</div>
        `
    } else {
        // Set the popup innet HTML to "Follow" or "Unfollow" depending on if the user is following the profile
        if (!userfollowed) {
            document.querySelector('#popup').innerHTML = `
            <div onclick="follow_toggle('${profile}', 'Follow', '${filter}', '${page}')">Follow ${profile}</div>
            `
        } else {
            document.querySelector('#popup').innerHTML = `
            <div onclick="follow_toggle('${profile}', 'Following', '${filter}', '${page}')">Unfollow ${profile}</div>
            `
        }
    }
    
    // Get the coordinate boundaries of the parent div closets to the mouse click
    const parentDimensions = document.elementFromPoint(event.clientX, event.clientY).getBoundingClientRect()

    // Set the postion of the popup so it's top right is aligned with the top right of the parent div
    Object.assign(document.querySelector('#popup').style , {
        left: `${parentDimensions.right + window.scrollX - 293}px`,
        top: `${parentDimensions.top + window.scrollY }px`,
    });

    // Set the is-active class to the popup
    document.querySelector('#popup').classList.add("is-active")
}

function deleteConfirmation(post_id, profile, filter, page) {
    // Check if a post is already being editted. If so do nothing, the user must cancel the edit and then click delete.
    // Check that the current user is the owner of the post. If the are not then do nothing (this is more for if someone uses the developer console to run the function).
    if (document.querySelector('.cancelEdit') || current_user !== document.getElementById(`post-${post_id}`).querySelector('#userprofile').innerHTML) return;

    // Show the modal div
    document.querySelector('#modal').showModal()

    // Listen for the delete button click. 
    document.querySelector('.deletePost').addEventListener('click', () => {
        // If clicked, send data to the server to delete the post, passing in the CSRF token
        fetch(`post/${post_id}`, {
            method: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            mode: 'same-origin',
            body: JSON.stringify({
                process : 'delete',
            })
        })
        .then(function(response) {
            if (response["status"] === 401)  {
                // If error 401 - unauthenticated user redirect to login page
                location.href = 'http://127.0.0.1:8000/login'
            } else if (response["status"] === 204) {
                // Reload list of posts from pagination data and close the modal div
                load_posts(`${profile}`, `${filter}`, `${page}`)
                document.querySelector('#modal').close()
            }
        })
    });

    // Listen for interaction with the cancel button. Close the dialog if the cancel button is clicked.
    document.querySelector('.cancelDelete').addEventListener('click', () => {
        document.querySelector('#modal').close()
    })
}

function editPost(post_id) {
    // Check if a post is already being editted. If so do nothing, the user must cancel the edit and then edit the new post.
    // Check that the current user is the owner of the post. If the are not then do nothing (this is more for if someone uses the developer console to run the function).
    if (document.querySelector('.cancelEdit') || current_user !== document.getElementById(`post-${post_id}`).querySelector('#userprofile').innerHTML) return;

    // Set variables for the post content div and the post responses div
    var post_text_div = document.getElementById(`post-${post_id}`).getElementsByClassName('post-text')[0]
    var post_response_div = document.getElementById(`post-${post_id}`).getElementsByClassName(`post-responses`)[0]

    // Set variables for the HTML of the initial post content and responses
    var initial_text = post_text_div.innerHTML
    var post_responses_initial_html = post_response_div.innerHTML

    // Edit the posts responses div to show two columns and set the new inner HTML to show a "Cancel" and "Update" button
    post_response_div.className = `post-responses span-2-col`
    post_response_div.innerHTML = `
    <div class="edit-option cancelEdit">Cancel</div>
    <div class="edit-option saveEdit">Update</div>
    `

    // Set the text div HTML to show a text area pre populated with the initial post content
    post_text_div.innerHTML = `
        <textarea name="content" cols="40" rows="2" maxlength="300" placeholder="What's happening?" required="" id="id_content">${initial_text}</textarea>
    `

    // Listen for the cancel edit button to be clicked.
    document.querySelector('.cancelEdit').addEventListener('click', () => {
        // Set the post row back to the initial settings
        post_text_div.innerHTML = `${initial_text}`
        post_response_div.className = 'post-responses span-3-col'
        post_response_div.innerHTML = `${post_responses_initial_html}`   
    })

    // Listen for the update edit button to be clicked.
    document.querySelector('.saveEdit').addEventListener('click', () => {
        // Set a constant of the updated text in the text area
        const updated_post_text = document.getElementById(`post-${post_id}`).querySelector('#id_content').value

        // Send the new post text to the server to be updated in the database, passing in the CSRF token
        fetch(`post/${post_id}`, {
            method: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            mode: 'same-origin',
            body: JSON.stringify({
                process: 'edit',
                updated_post_text: updated_post_text
            })
        })
        .then(function(response) {
            if (response["status"] === 401)  {
                // If error 401 - unauthenticated user redirect to login page
                location.href = 'http://127.0.0.1:8000/login'
            } else if (response["status"] === 204) {
                // If HTTP response 204, reset the post responses div to the initial HTML and update the post content div to the updated post text
                post_text_div.innerHTML = `${updated_post_text}`
                post_response_div.className = 'post-responses span-3-col'
                post_response_div.innerHTML = `${post_responses_initial_html}` 
            }
        })
    })
}

// Function used to retrieve CSRF token. This code is from Django documentation.
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


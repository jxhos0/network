document.addEventListener('DOMContentLoaded', function() {
    try {
        current_user = document.querySelector('.current-user').innerHTML
        console.log(`logged in user: ${current_user}`)
    } catch (error) {
        current_user = 'anonymous'
    }
    
    if (document.getElementById('home-container')) {

        if (current_user !== 'anonymous') {
            document.querySelector('#all-posts').addEventListener('click', () => {
                document.querySelector('#all-posts .selector').className = 'selector'
                document.querySelector('#following .selector').className = 'selector hidden'
                load_posts(`${current_user}`, 'all-posts', 1)
            });
            document.querySelector('#following').addEventListener('click', () => {
                document.querySelector('#all-posts .selector').className = 'selector hidden'
                document.querySelector('#following .selector').className = 'selector'
                load_posts(`${current_user}`, 'following', 1)
            });

            // Select the submit button and input to be used later
            const submit = document.querySelector('#submit');
            const newPost = document.querySelector('#id_content');

            // Disable submit button by default:
            submit.disabled = true;

            // Listen for input to be typed into the input field
            newPost.onkeyup = () => {
                if (newPost.value.length > 0) {
                    submit.disabled = false;
                }
                else {
                    submit.disabled = true;
                }
            }

            load_posts(`${current_user}`, 'all-posts', 1)
        } else {
            load_posts('index', 'all-posts', 1)
        }

    } else if (document.getElementById('profile-container')) {
        var profile = document.querySelector('.profile-user').innerHTML

        document.querySelector('#profile-posts').addEventListener('click', () => {
            document.querySelector('#profile-posts .selector').className = 'selector'
            document.querySelector('#profile-comments .selector').className = 'selector hidden'
            document.querySelector('#profile-likes .selector').className = 'selector hidden'
            load_posts(`${profile}`, 'profile-posts', 1)
        });
        
        document.querySelector('#profile-comments').addEventListener('click', () => {
            document.querySelector('#profile-posts .selector').className = 'selector hidden'
            document.querySelector('#profile-comments .selector').className = 'selector'
            document.querySelector('#profile-likes .selector').className = 'selector hidden'
            load_posts(`${profile}`, 'profile-comments', 1)
        });
        
        
        document.querySelector('#profile-likes').addEventListener('click', () => {
            document.querySelector('#profile-posts .selector').className = 'selector hidden'
            document.querySelector('#profile-comments .selector').className = 'selector hidden'
            document.querySelector('#profile-likes .selector').className = 'selector '
            load_posts(`${profile}`, 'profile-likes', 1)
        });

        if (document.querySelector('#follow')) {
            document.querySelector('#follow').addEventListener('click', () => follow_toggle(profile, document.querySelector('.followed-value').innerHTML))
        }

        load_posts(`${profile}`, 'profile-posts', 1)
    } 

    document.querySelector("html").addEventListener("click", () => {
        if (document.querySelector('.is-active')) {
            if (event.target.closest(".post-options")) return;
            document.querySelector('#popup').classList.remove("is-active")

        }
    })    
})


function load_posts(profile, filter, page) {

    document.querySelector('.posts-container').innerHTML = ''
    
    fetch(`/posts/${profile}?filter=${filter}&page=${page}`)
    .then(response => response.json())
    .then(response => {

        var current_page = Number(page)
        var number_pages = Number(response['number_pages'])
        var posts = response['posts']

        if (posts.length > 0) {
            posts.forEach(post => {

                // Create post row div
                const post_row = document.createElement('div');
                post_row.setAttribute('id', `post-${post.id}`)
                post_row.classList.add('post-container');

                const image_html = post.poster_img ? `<img src="${ post.poster_img }" height="48px" width="48px" class="profile-img">` : `<div class="no-profile-img"><h4>${ post.user["0"].toUpperCase() }</h4></div>`
                const likes = post.likes > 0 ? post.likes : ''
                const liked = post.liked ? 'liked' : 'like'
                const likedSVG = post.liked ? '<path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>' : '<path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>'
                
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

                document.querySelector('.posts-container').append(post_row);
            })

            if (number_pages > 1) {
                const paginator = document.createElement('div');
                paginator.classList.add('paginator');
                paginator.innerHTML = `<a class="page-link"><b>${current_page}</b>&ensp;&ensp;/&ensp;&ensp;<b>${number_pages}</b></a>`
                document.querySelector('.posts-container').append(paginator);
    
                if (current_page === 1) {
                    document.querySelector('.paginator').insertAdjacentHTML("afterbegin", `
                    <a class="page-link hidden" disabled>&laquo; </a>
                    <a class="page-link hidden" disabled>&lt; </a>
                    `)
                } else {
                    document.querySelector('.paginator').insertAdjacentHTML("afterbegin", `
                    <a class="page-link"  onclick="load_posts('${profile}', '${filter}', 1)">&laquo; </a>
                    <a class="page-link" onclick="load_posts('${profile}', '${filter}', '${current_page - 1}')">&lt; </a>
                    `)
                }
    
                if (current_page === number_pages) {
                    document.querySelector('.paginator').insertAdjacentHTML("beforeend", `
                    <a class="page-link hidden" disabled> &gt;</a>
                    <a class="page-link hidden" disabled> &raquo;</a>
                    `)
                } else {
                    document.querySelector('.paginator').insertAdjacentHTML("beforeend", `
                    <a class="page-link" onclick="load_posts('${profile}', '${filter}', '${current_page + 1}')"> &gt;</a>
                    <a class="page-link" onclick="load_posts('${profile}', '${filter}', '${number_pages}')"> &raquo;</a>
                    `)
                }
            }

        } else {
            const message = document.createElement('div');
            message.classList.add('no-posts-message');
            message.innerHTML = `${profile} currently has no posts to view in this list.`
            document.querySelector('.posts-container').append(message);
        }
    })
}

function follow_toggle(profile, followed_value, filter, page) {

    if (current_user === profile) return;
    
    fetch(`${profile}`, {
        method: 'PUT',
        headers: {'X-CSRFToken': getCookie('csrftoken')},
        mode: 'same-origin',
        body: JSON.stringify({
            followed : followed_value
        })
    })
    .then(function(response) {
        if (response["status"] === 401)  {
            location.href = 'http://127.0.0.1:8000/login'
        } else if (response["status"] === 204) {
            if (filter || page) {
                load_posts(`${profile}`, `${filter}`, `${page}`)
            } else {
                location.reload()
            }
        }
    })
}

function like_toggle(post_id, profile, filter, page) {

    fetch(`post/${post_id}`, {
        method: 'PUT',
        headers: {'X-CSRFToken': getCookie('csrftoken')},
        mode: 'same-origin',
        body: JSON.stringify({
            id: post_id
        })
    })
    .then(function(response) {
        if (response["status"] === 401)  {
            location.href = 'http://127.0.0.1:8000/login'
        } else if (response["status"] === 204) {
            load_posts(`${profile}`, `${filter}`, `${page}`)
        }
    })
}

// function reload_post(post_id) {

// }

function postOptions(post_id, profile, userpost, userfollowed, filter, page) {

    if (userpost) {
        document.querySelector('#popup').innerHTML = `
        <div onclick="editPost(${post_id})">Edit Post</div>
        <div style="color:red" onclick="deleteConfirmation(${post_id}, '${profile}', '${filter}', '${page}')">Delete Post</div>
        `
    } else {
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
    
    const parentDimensions = document.elementFromPoint(event.clientX, event.clientY).getBoundingClientRect()

    Object.assign(document.querySelector('#popup').style , {
        left: `${parentDimensions.right + window.scrollX - 293}px`,
        top: `${parentDimensions.top + window.scrollY }px`,
    });
    document.querySelector('#popup').classList.add("is-active")

}

function deleteConfirmation(post_id, profile, filter, page) {

    if (document.querySelector('.cancelEdit') || current_user !== document.getElementById(`post-${post_id}`).querySelector('#userprofile').innerHTML) return;

    document.querySelector('#modal').showModal()

    document.querySelector('.deletePost').addEventListener('click', () => {
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
                location.href = 'http://127.0.0.1:8000/login'
            } else if (response["status"] === 204) {
                load_posts(`${profile}`, `${filter}`, `${page}`)
                document.querySelector('#modal').close()
            }
        })
    });

    document.querySelector('.cancelDelete').addEventListener('click', () => {
        document.querySelector('#modal').close()
    })
}

function editPost(post_id) {
    if (document.querySelector('.cancelEdit') || current_user !== document.getElementById(`post-${post_id}`).querySelector('#userprofile').innerHTML) return;

    var post_text_div = document.getElementById(`post-${post_id}`).getElementsByClassName('post-text')[0]
    var post_response_div = document.getElementById(`post-${post_id}`).getElementsByClassName(`post-responses`)[0]

    var initial_text = post_text_div.innerHTML
    var post_responses_initial_html = post_response_div.innerHTML

    post_response_div.className = `post-responses span-2-col`

    post_response_div.innerHTML = `
    <div class="edit-option cancelEdit">Cancel</div>
    <div class="edit-option saveEdit">Update</div>
    `

    post_text_div.innerHTML = `
        <textarea name="content" cols="40" rows="2" maxlength="300" placeholder="What's happening?" required="" id="id_content">${initial_text}</textarea>
    `

    document.querySelector('.cancelEdit').addEventListener('click', () => {
        post_text_div.innerHTML = `${initial_text}`
        post_response_div.className = 'post-responses span-3-col'
        post_response_div.innerHTML = `${post_responses_initial_html}`   
    })

    document.querySelector('.saveEdit').addEventListener('click', () => {
        const updated_post_text = document.getElementById(`post-${post_id}`).querySelector('#id_content').value

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
                location.href = 'http://127.0.0.1:8000/login'
            } else if (response["status"] === 204) {
                post_text_div.innerHTML = `${updated_post_text}`
                post_response_div.className = 'post-responses span-3-col'
                post_response_div.innerHTML = `${post_responses_initial_html}` 
            }
        })
    })
}

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

// function formatDateTime(timestamp) {
//     var m = new Date(timestamp);
//     var dateString = m.getUTCFullYear() +"/"+ (m.getUTCMonth()+1) +"/"+ m.getUTCDate() + " " + m.getUTCHours() + ":" + m.getUTCMinutes() + ":" + m.getUTCSeconds();
    
//     return dateString
// }
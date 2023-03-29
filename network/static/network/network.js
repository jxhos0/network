document.addEventListener('DOMContentLoaded', function() {

    

    if (document.getElementById('home-container')) {
        var profile = document.querySelector('.current-user').innerHTML

        document.querySelector('#all-posts').addEventListener('click', () => load_posts(`${profile}`, 'all-posts'));
        document.querySelector('#following').addEventListener('click', () => load_posts(`${profile}`, 'following'));
        // console.log('index page')


        // // Select the submit button and input to be used later
        // const submit = document.querySelector('#submit');
        // const newPost = document.querySelector('#id_content');

        // // Disable submit button by default:
        // submit.disabled = true;

        // // Listen for input to be typed into the input field
        // newPost.onkeyup = () => {
        //     if (newPost.value.length > 0) {
        //         submit.disabled = false;
        //     }
        //     else {
        //         submit.disabled = true;
        //     }
        // }

        load_posts(`${profile}`, 'all-posts')


    } else if (document.getElementById('profile-container')) {
        var profile = document.querySelector('.profile-user').innerHTML
        console.log(document.querySelector('.profile-user').innerHTML)

        // console.log(document.querySelector('#follow').innerHTML)


        document.querySelector('#profile-posts').addEventListener('click', () => load_posts(`${profile}`, 'profile-posts'));
        document.querySelector('#profile-comments').addEventListener('click', () => load_posts(`${profile}`, 'profile-comments'));
        document.querySelector('#profile-likes').addEventListener('click', () => load_posts(`${profile}`, 'profile-likes'));
        document.querySelector('#follow').addEventListener('click', () => follow_toggle(document.querySelector('.profile-user').innerHTML, document.querySelector('#follow').innerHTML))

        load_posts(`${profile}`, 'profile-posts')
    } 

})

function load_profile() {
    var profile = document.querySelector('.profile-user').innerHTML

    load_posts(profile)
}

function follow_toggle(profile, followed_value) {
    console.log(`${profile} ${followed_value}ed`)

    fetch(`${profile}`, {
        method: 'PUT',
        body: JSON.stringify({
            followed : followed_value
        })
    })
    .then(() => {
        location.reload()
    })
}

function load_posts(profile, filter) {

    document.querySelector('.posts-container').innerHTML = ''
    
    fetch(`/posts/${profile}?filter=${filter}`)
    .then(response => response.json())
    .then(posts => {
        console.log(posts)
        posts.forEach(post => {

            // Create post row div
            const post_row = document.createElement('div');
            post_row.classList.add('post-container');

            const image_html = post.poster_img ? `<img src="${ post.poster_img }" height="48px" width="48px" class="profile-img">` : `<div class="no-profile-img"><h4>${ post.user["0"].toUpperCase() }</h4></div>`
            post_row.innerHTML = `
                <div class="profile-pic">
                    ${image_html}
                </div>
                <div class="post-content">
                    <div class="post-head">
                        <div class="post-details">
                            <b><a id="userprofile" href="${ post.user }">${ post.user }</a></b> ${ formatDateTime(post.timestamp) }
                        </div>
                        <div class="post-options">&#8226;&#8226;&#8226;</div>
                    </div>
                    <div class="post-text">${ post.content }</div>
                    <div class="post-responses span-3-col">
                        <div class="like" onclick="like_toggle(${post.id})">Like</div>
                        <div class="comment">Comment</div>
                        <div class="share">Share</div>
                    </div>
                </div>
                `

            document.querySelector('.posts-container').append(post_row);
        })
    })
}

function formatDateTime(timestamp) {
    var m = new Date(timestamp);
    var dateString = m.getUTCFullYear() +"/"+ (m.getUTCMonth()+1) +"/"+ m.getUTCDate() + " " + m.getUTCHours() + ":" + m.getUTCMinutes() + ":" + m.getUTCSeconds();
    
    return dateString
}
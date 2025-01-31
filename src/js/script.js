let modal = null
let tmp_ = undefined

const cache = {
    modal: {},
    posts: null,
} 

//Retornar un booleano para indicar si se le añadió la clase
function toggleClass(element, clase) {
    if (element.matches('.' + clase)) {
        element.classList.remove(clase) 
        return false
    } else {
        element.classList.add(clase)
        return true
    }
}

function toggleModal(post) {
    if (!toggleClass(modal, 'visible')) return 

    cache.modal.form.style.display = 'none'
    cache.modal.formImg.style.display = 'none'
    cache.modal.formBtns.style.display = 'none'
    cache.modal.post.style.display = 'none'
    cache.modal.comments.style.display = 'none'
    cache.modal.addComment.style.display = 'none'
    cache.modal.comments.parentNode.scrollTop = 0

    if (post) {
        cache.modal.post.style.display = 'flex'
        cache.modal.comments.style.display = 'flex'
        if (USER_ID != 'none') cache.modal.addComment.style.display = 'flex'
        cache.modal.profileImage.src = post.querySelector('img').src
        cache.modal.date.innerText = post.querySelector('span').innerText
        cache.modal.date.title = post.querySelector('span').title

        const previewP = modal.querySelector('#popup-post-p')
        const postText = post.querySelector('.post-text')
        const postImg = post.querySelector('.post-img')
        const anchor = post.querySelector('a')

        cache.modal.name.innerHTML = anchor.innerHTML
        cache.modal.name.href = anchor.href

        if (postText) {
            previewP.innerText = postText.innerText
            previewP.style.display = 'block'
        } else {
            previewP.style.display = 'none'
        }
        if (postImg) {
            cache.modal.postImg.src = postImg.src
            cache.modal.postImg.style.display = 'block'
        } else {
            cache.modal.postImg.style.display = 'none'
        }
    } else {
        cache.modal.form.style.display = 'flex'
        cache.modal.textarea.style.height = 'auto'
        cache.modal.textarea.style.height = `${ cache.modal.textarea.scrollHeight}px`
        if (cache.modal.formImg.src) cache.modal.formImg.style.display = 'block'
        cache.modal.formBtns.style.display = 'flex'
        cache.modal.profileImage.src = USER_IMG 
        cache.modal.name.innerText = USER_NAME
        cache.modal.date.innerText = 'Now'
        cache.modal.date.title = ''
    }
}

function popupOptions(parent, userId) {
    let floatBox = parent.querySelector('aside')

    if (!floatBox) {
        floatBox = document.createElement('aside')
        floatBox.className = 'popup-options-box'
        floatBox.innerHTML = `
        <button aria-label="Report">
            Reportar
            <span aria-hidden="true" class="material-symbols-rounded">report<span>
        </button>
        `
        if (USER_IS_MOD || userId === USER_NAME) {
            floatBox.innerHTML += `
            <button aria-label="Delete">
                Eliminar
                <span aria-hidden="true" class="material-symbols-rounded">delete<span>
            </button>
            `
        } else {
            floatBox.innerHTML += `
            <button aria-label="Delete">
                Ocultar
                <span aria-hidden="true" class="material-symbols-rounded">visibility_off<span>
            </button>
            `
        }

        parent.appendChild(floatBox)

        setTimeout(() => { toggleClass(floatBox, 'visible') }, 0)

        tmp_ = floatBox
    } else {
        tmp_ = toggleClass(floatBox, 'visible') ? floatBox : undefined
    }
}

function deleteThing(id, callBackStyle) {
    const PATH = location.pathname != '/' ? '../' : './'
    $.ajax({
        type: 'POST',
        url: PATH + 'model/delete_post.php',
        data: { id },
        success: () => {
            callBackStyle(true)
        },
        error: (xhr, status, error) => {
            console.error(error)
            callBackStyle(false)
        }
    })
}

document.onclick = e => {
    let i = e.target
    let parent = i.parentNode

    //Ocultar ultimo aside
    if (tmp_ && i != tmp_) {
        const btnMore = tmp_.parentNode.querySelector('.btn-more')

        if (btnMore) {
            if (i.tagName === 'SPAN') {
                if (!parent.matches('.btn-more')) {
                    btnMore.click()
                }
            } else if (!i.matches('.btn-more')) {
                btnMore.click()
            }
        } else {
            const btnChoose = tmp_.parentNode.querySelector('button[aria-label="Choose"]')
            
            if (btnChoose) {
                if (i.tagName === 'SPAN') {
                    if (!parent.matches('button[aria-label="Choose"]')) {
                        document.querySelector('ul').classList.remove('visible')
                    }
                } else if (!i.matches('button[aria-label="Choose"]')) {
                    document.querySelector('ul').classList.remove('visible')
                }
                if (parent === tmp_) {
                    btnChoose.value = i.innerText
                    btnChoose.querySelector('p').innerText = i.innerText
                }
            }
        }

        tmp_ = undefined
    }

    //SI presiono en la imagen de un post, abrir comentarios
    if (i.matches('.post-img')) { 
        parent.parentNode.querySelector('button[aria-label="Show comments"]').click() 
    }

    //Only buttons
    if (parent.tagName === 'BUTTON' || parent.tagName === 'A') {
        i = parent; parent = parent.parentNode
    } else if (i.tagName != 'BUTTON' && i.tagName != 'A') return

    const ariaLabel = i.getAttribute('aria-label')

    //Mostrar modal de editar perfil
    if (i.matches('#btn-edit')) {
        if (toggleClass(modal, 'visible-profile')) {
            cache.modal.textareaBio.innerText = document.querySelector('#user-description').innerText
        }
    }

    //Si es un boton de la Nav Tools
    if (i.closest('.nav-tools')) {
        parent.querySelector('.selected').classList.remove('selected')
        
        switch (ariaLabel) {
            case 'More':
                toggleModal()
            break
        }

        i.classList.add('selected')
    } else
    //Si es un boton del modal
    if (i.closest('#modal')) {
        switch (ariaLabel) {
            case 'Close':
                modal.className = ''
            break
            case 'Send comment':
                const box = i.closest('#popup-add-comment')
                sendComment(box, box.getAttribute('data-post-id'))
            break
            case 'Submit':
                i.closest('article').querySelector('.popup-content').querySelector('form').submit()
            break
        }
    } else
    //Si es un boton del post
    if (ariaLabel && i.closest('.post')) {

        const post = i.closest('.post')
        const postId = post.getAttribute('data-post-id')
        const userId = post.querySelector('.head-user').getAttribute('data-user-id')

        switch (ariaLabel) {
            case 'Like':
                const likeCounter = post.querySelector('.post-like-counter')
                likePost(postId, likeCounter, i)
            break
            case 'Show comments':
                toggleModal(post)
                getComments(postId)
                cache.modal.addComment.setAttribute('data-post-id', postId)
            break
            case 'Add comment':
                const boxInputComment = post.querySelector('.post-add-comment')
                if (boxInputComment) {
                    const input = post.querySelector('.input-comment')
                    const btn = post.querySelector('.btn-send')
                    const isDisabled = toggleClass(boxInputComment, 'visible') ? false : true
                    input.disabled = isDisabled
                    btn.disabled = isDisabled
                    if (!isDisabled) input.focus()
                }
            break
            case 'Send comment':
                sendComment(post, postId)
            break
            case 'Options':
                popupOptions(parent, userId)
            break
            case 'Delete':
                post.querySelector('aside').classList.remove('visible')
                post.classList.add('waiting')  

                const callBackStyle = (success) => {
                    if (success) {
                        post.classList.add('deleted')
                        post.style.height = getComputedStyle(post).getPropertyValue('height')
                        setTimeout(() => { post.style.height = 0 }, 50)
                        setTimeout(() => { post.parentNode.removeChild(post) }, 250)
                    } else {
                        post.classList.remove('waiting')
                    }
                }

                deleteThing(postId, callBackStyle)
        }
    } else 
    //Si es un boton del article
    if (ariaLabel && i.closest('.article')) {

        const article = i.closest('.article')
        const id = article.getAttribute('data-article-id')
        const userId = i.closest('.head-user').getAttribute('data-user-id')

        switch (ariaLabel) {
            case 'Options':
                popupOptions(parent, userId)
            break
            case 'Delete':
                article.classList.add('waiting')
        
                const cb = (success) => {
                    if (success) {
                        article.classList.add('deleted')

                        let h = getComputedStyle(article).getPropertyValue('height')
        
                        article.style.height = h

                        setTimeout(() => { article.style.height = 0 }, 50)
                        setTimeout(() => { article.parentNode.removeChild(article) }, 300)
                    } else {
                        article.classList.remove('waiting')
                    }
                }

                deleteThing(id, cb)
            break
        }
    } else 
    //Si el el choose de crear articles
    if (ariaLabel === 'Choose') {
        const list = parent.querySelector('ul')
       toggleClass(list, 'visible')
       tmp_ = list
    }
}

document.onkeydown = e => {
    let k = e.key.toLowerCase()
    let i = e.target
    let parent = i.parentNode
    switch (k) {
        case 'enter':
            if (i.tagName === 'INPUT') e.preventDefault()

            if (i.matches('.input-comment')) {
                parent.querySelector('.btn-send').click()
            } else if (i.matches('input[type="file"]')) {
                i.click()
            } else if (i === cache.modal.textarea) {
                if(!e.shiftKey) {
                    e.preventDefault()
                    cache.modal.form.querySelector('form').submit()
                }
            } else if (parent.tagName === 'UL') {
                i.click()
            }
        break
        case 'escape':
            if (modal && modal.matches('.visible')) modal.classList.remove('visible')
            else if (modal && modal.matches('.visible-profile')) modal.classList.remove('visible-profile')
        break
        case 'tab':
            setTimeout(() => {
                if (
                    modal && modal.matches('.visible') && 
                    !document.activeElement.closest('#popup')
                ) {
                    cache.modal.btnClose.focus()
                }
            }, 1)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Codigo de filtrar por categoria
    const links = document.querySelectorAll('a[data-materia]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const materia = this.getAttribute('data-materia');
            
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '../model/cargar_materia.php?materia=' + encodeURIComponent(materia), true);
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    document.getElementById('cantainer_articles').innerHTML = xhr.responseText;
                }
            };
            
            xhr.send();
        });
    });
    // Fin filtrar por categoria
    // Aquí comienza el codigo de la busqueda
    const textoInput = document.getElementById("search");
    const resultadosDiv = document.getElementById("answer");

    if (textoInput) {
        textoInput.oninput = () => {
            const texto = textoInput.value;

            if (texto.length > 0) {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", "../model/search.php", true);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                        const coincidencias = JSON.parse(xhr.responseText);
                        mostrarResultados(coincidencias);
                    }
                };
                
                const params = "texto=" + encodeURIComponent(texto);
                xhr.send(params);
            } else {
                resultadosDiv.innerHTML = "";
            }
        }
    }

    function mostrarResultados(coincidencias) {
        let html = "";

        coincidencias.forEach(function(coincidencia) {
            html += `<p>ID: ${coincidencia.id}</p>`;
            html += `<p>Título: ${coincidencia.title}</p>`;
            html += `<p>Contenido: ${coincidencia.content}</p>`;
            html += "<hr>";
        });

        resultadosDiv.innerHTML = html;
    }
    // Aquí culmina el codigo de la busqueda

    const PATH = location.pathname === '/' ? './' : '../'
    let page = location.pathname.split('article.php')
    if (page.length > 1) return
    page = location.pathname.split('preview.php')
    if (page.length > 1) return
    page = location.pathname.split('preview.php')
    if (page.length > 1) return
    page = location.pathname.split('profile.php')

    const container = document.querySelector('.container')
    const posts = document.querySelector('.posts')

    if (window.innerWidth <= 850) {
        if (container) { 
            container.scrollLeft = container.scrollWidth
            if (page.length < 2) setTimeout(() => container.scrollLeft = 0, 1200)
        }
    } else if (posts) { 
        posts.scrollTop = 500
        setTimeout(() => posts.scrollTop = 0, 1000) 
    }

    modal = document.createElement('section')
    modal.id = 'modal'
    modal.innerHTML = `
    <article id="popup">
        <section class="popup-bar-top">
            <img src="${USER_IMG}" alt="Profile image">
            <div>
                <a>${USER_NAME}</a>
                <span>Now</span>
            </div>
            <button aria-label="Close">
                <span aria-hidden="true" class="material-symbols-rounded">close</span>
            </button>
        </section>
        <section class="popup-content"> 
            <div id="popup-form">
                <form action="${PATH}model/subir_post.php" method="POST">
                    <textarea rows=1 name="description" placeholder="¿Qué estás pensando?... Tranqui, no somos Facebook"></textarea>
                </form>
                <img id="popup-form-img" alt="Preview post image">
            </div>
            <div id="popup-post"> 
                <p id="popup-post-p"></p>
                <img id="popup-post-img" alt="Post image">
            </div>
            <span aria-label="Loading" aria-hidden="true" class="material-symbols-rounded rotating icon-load">progress_activity</span>
            <div id="popup-post-comments"></div>
        </section>
        <section class="popup-bar-bottom">
            <div role="form" class="popup-form-buttons">
                <label role="input" id="input-post-img">
                    <input type="file" name="img-post">
                    <span aria-hidden="true" class="material-symbols-rounded">image</span>
                </label>
                <button disabled aria-label="Submit" type="submit">Publicar</button>
            </div>
            <div role="form" id="popup-add-comment">
                <input class="input-comment" autocomplete="off" type="text" placeholder="Escribe un comentario"></input>
                <button type="submit" aria-label="Send comment" class="btn-send">
                    <span aria-hidden="true" class="material-symbols-rounded">send</span>
                </button>
            </div>
        </section>
    </article>
    `
    if (page.length > 1) {
        modal.innerHTML += `
        <article id="popup-profile">
            <section class="popup-bar-top">
                <h1 class="popup-title">Editar perfil</h1>
                <button aria-label="Close">
                    <span aria-hidden="true" class="material-symbols-rounded">close</span>
                </button>
            </section>
            <section class="popup-content">
                <div id="box-profile-photo">
                    <img id="edit-img-profile" src="${USER_IMG}" alt="Preview of new profile image">
                    <input title="Change profile photo" type="file" name="img-profile">
                    <span aria-hidden="true" class="material-symbols-rounded">photo_camera</span>
                </div>
                <form action="${PATH}model/update_profile.php" method="POST">
                    <label id="input-name">
                        <input type="text" maxlength=30 autocomplete="Off" name="profile_name" placeholder="Name" value="${USER_NAME}">
                        <span aria-hidden="true" class="material-symbols-rounded">edit</span>
                    </label>
                    <textarea name="profile_bio" placeholder="Description"></textarea>
                </form>
            </section>
            <section class="popup-bar-bottom">
                <div role="form" class="popup-form-buttons">
                    <button class="available" aria-label="Submit" type="submit">Guardar</button>
                </div>
            </section>
        </article>
        `
    }

    cache.modal.profileImage = modal.querySelector('img')
    cache.modal.name = modal.querySelector('a')
    cache.modal.date = modal.querySelector('span')
    cache.modal.btnClose = modal.querySelector('button')
    cache.modal.form = modal.querySelector('#popup-form')
    cache.modal.formImg = modal.querySelector('#popup-form-img')
    cache.modal.textarea = modal.querySelector('textarea')
    cache.modal.formBtns = modal.querySelector('.popup-form-buttons')
    cache.modal.btnSubmit = cache.modal.formBtns.querySelector('button')
    cache.modal.post = modal.querySelector('#popup-post')
    cache.modal.postImg = modal.querySelector('#popup-post-img')
    cache.modal.comments = modal.querySelector('#popup-post-comments')
    cache.modal.addComment = modal.querySelector('#popup-add-comment')
    cache.modal.inputComment = modal.querySelector('.input-comment')
    cache.modal.textareaBio = modal.querySelector('textarea[name="profile_bio"]')
    
    const inputFilePost = modal.querySelector('input[name="img-post"]')
    const imageFormPost = cache.modal.form.querySelector('img')
    const inputFileProfile = modal.querySelector('input[name="img-profile"]')
    const editImageProfile = modal.querySelector('#edit-img-profile')

    cache.modal.textarea.oninput = function() {
        this.style.height = 'auto'

        if (this.scrollHeight < 105) {
            this.style.height = `${this.scrollHeight}px`
        } else {
            this.style.height = `${105}px`
        }

        console.log('joaa')
        if (this.value.length > 0 || imageFormPost.src) { 
            cache.modal.btnSubmit.disabled = false
            cache.modal.btnSubmit.classList.add('available')
        } else { 
            cache.modal.btnSubmit.disabled = true 
            cache.modal.btnSubmit.classList.remove('available') 
        }
    }
    inputFilePost.onchange = function() {
        if (this.files.length > 0) { 
            cache.modal.btnSubmit.disabled = false
            cache.modal.btnSubmit.classList.add('available')
            cache.modal.lastFile = true
        } else {
            if (cache.modal.lastFile) return
            cache.modal.btnSubmit.disabled = true 
            cache.modal.btnSubmit.classList.remove('available') 
            return
        }

        let file = this.files[0]
        let formData = new FormData()
        formData.append('imagen', file)

        let xhr = new XMLHttpRequest();

        xhr.open('POST', PATH + 'model/set_image_post.php')

        xhr.onload = () => {
            if (xhr.status === 200) {
                cache.modal.formImg.src = PATH + xhr.response 
                cache.modal.formImg.style.display = 'block'
            } else {
                console.error('Error al cargar la imagen:', xhr.statusText)
            }
        }

        xhr.onerror = () => {
            console.error('Error de red al cargar la imagen')
        }

        xhr.send(formData)
    }
    if (inputFileProfile) {
        inputFileProfile.onchange = function() {
            if (this.files.length === 0) return 
    
            const file = this.files[0]
            const formData = new FormData()
            formData.append('imagen', file)
    
            const xhr = new XMLHttpRequest();
    
            xhr.open('POST', PATH + 'model/set_image_profile.php')
    
            xhr.onload = () => {
                if (xhr.status === 200) {
                    editImageProfile.src = PATH + xhr.response 
                } else {
                    console.error('Error al cargar la imagen:', xhr.status)
                }
            }
    
            xhr.onerror = () => {
                console.error('Error de red al cargar la imagen')
            }
    
            xhr.send(formData)
        }
    }   

    document.body.prepend(modal)
})
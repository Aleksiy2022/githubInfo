class View {
  constructor() {
    this.body = document.querySelector('body')
    this.main = this.createElement('main')
    this.container = this.createElement('div', 'container')
    this.input = this.createElement('input', 'input-area')
    this.repositories = this.createElement('ul', 'repository-list')
    this.savedRepositories = this.createElement('ul', 'saved-repositories--list')
    this.savedRepo = this.createElement('li', 'saved-repository-list--item')
    this.delButton = this.createElement('button', 'del-button')
    this.img = this.createElement('img', 'image')
    this.img.src = 'icons8-крестик-48.png'

    this.body.append(this.main)
    this.main.append(this.container)
    this.container.append(this.input)
    this.container.append(this.repositories)
    this.container.append(this.savedRepositories)
    this.delButton.append(this.img)

    this.body.addEventListener('click', (e) => {
      if (e.target.parentElement.parentElement.classList.contains('saved-repository-list--item')) {
        e.target.parentElement.parentElement.remove()
      }
    })
  }

  createElement(tagName, className) {
    const element = document.createElement(tagName)
    if (className) element.classList.add(className)
    return element
  }

  createSavedRepoView(e, repo) {
    let savedRepoClone = this.savedRepo.cloneNode(true)
    let buttonClone = this.delButton.cloneNode(true)
    savedRepoClone.insertAdjacentHTML(
        'afterbegin',
        `
            <span>Name: ${repo.name}</span>
            <span>Owner: ${repo.owner.login}</span>
            <span>Stars: ${repo.stargazers_count}</span>
        `
    )
    savedRepoClone.append(buttonClone)
    this.savedRepositories.append(savedRepoClone)
  }

  clearSearhedData() {
    this.repositories.replaceChildren()
  }

  async createReposView(repoData) {
    let fragment = document.createDocumentFragment()
    let createReposPromises = repoData.map(async (repo) => {
      let newRepo = this.createElement('li', 'repository-list--item')
      newRepo.addEventListener('click', e => this.createSavedRepoView(e, repo))
      newRepo.textContent = repo.name
      return newRepo
    })
    Promise.all(createReposPromises)
      .then((elements) => {
        fragment.append(...elements)
        this.clearSearhedData()
        this.repositories.append(fragment)
    })
  }
}

class Search {
  constructor(view) {
    this.view = view
    this.debouncedSearch = this.debounce(this.searchRepositories.bind(this), 500)
    this.view.input.addEventListener('keyup', (e) => {
      const query = e.target.value
      this.debouncedSearch(query)
    })
  }

  async searchRepositories(query) {
    if (!query || query.trim().length === 0) {
      console.log('Пустой запрос на поиск')
      this.view.clearSearhedData()
      return
    }
    return await fetch(`https://api.github.com/search/repositories?q=${query}`)
                    .then(res => {
                      if (res.status === 200) {
                        res.json()
                          .then(data => {
                            const repositories = data.items <= 5 ? data.items : data.items.slice(0, 5)
                            this.view.createReposView(repositories)
                          })
                      }
                    })
                    .catch(err => {
                      if (err.name = 'TypeError') {
                        console.log(err.message)
                      }
                    });
  }

  debounce(fn, ms) {
    let timeout;
    return (...args) => {
      return new Promise(resolve => {
        const fnCall = () => resolve(fn.apply(this, args)); // Возвращаем результат вызова
        clearTimeout(timeout);
        timeout = setTimeout(fnCall, ms);
      });
    };
  }
}

new Search(new View())
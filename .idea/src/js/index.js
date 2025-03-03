class View {
  constructor() {
    this.body = document.querySelector('body')
    this.main = this.createElement('main')
    this.container = this.createElement('div', 'container')
    this.input = this.createElement('input', 'input-area')
    this.repositories = this.createElement('ul', 'repository-list')
    this.currentRepositories = document.querySelectorAll('.repository-list--itemt')

    this.body.append(this.main)
    this.main.append(this.container)
    this.container.append(this.input)
    this.container.append(this.repositories)
  }

  createElement(tagName, className) {
    const element = document.createElement(tagName)
    if (className) element.classList.add(className)
    return element
  }

  clearSearhedData() {
    this.repositories.replaceChildren()
  }

  async createReposView(repoData) {
    let fragment = document.createDocumentFragment()
    let createReposPromises = repoData.map(async (repo) => {
      let newRepo = this.createElement('li', 'repository-list--item')
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
    if (!query) {
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
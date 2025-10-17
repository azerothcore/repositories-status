new Vue({
    el: '#app',
    data () {
      return {
        repositories: [],
        loading: true,
        error: null,
        searchQuery: ''
      }
    },
    computed: {
        filteredRepositories() {
            if (!this.searchQuery) {
                return this.repositories
            }

            const query = this.searchQuery.toLowerCase().trim()

            return this.repositories.filter(repo => {
                const name = repo.name ? repo.name.toLowerCase() : ''
                const description = repo.description ? repo.description.toLowerCase() : ''
                const topics = repo.topics ? repo.topics.join(' ').toLowerCase() : ''

                return name.includes(query) || description.includes(query) || topics.includes(query)
            })
        },
        repositoryCount() {
            return {
                total: this.repositories.length,
                filtered: this.filteredRepositories.length
            }
        }
    },
    methods: {
        clearSearch() {
            this.searchQuery = ''
        }
    },
    mounted () {
        axios
            .get('https://api.github.com/orgs/azerothcore/repos?per_page=100&sort=updated&direction=desc')
            .then(response => {
                this.repositories = response.data
                this.error = null
            })
            .catch(error => {
                console.error('Error fetching repositories:', error)
                if (error.response) {
                    this.error = `Server error: ${error.response.status} - ${error.response.statusText}`
                } else if (error.request) {
                    this.error = 'Network error: Unable to reach GitHub API. Please check your connection.'
                } else {
                    this.error = 'An unexpected error occurred. Please try again later.'
                }
                this.repositories = []
            })
            .finally(() => this.loading = false)
    }
})

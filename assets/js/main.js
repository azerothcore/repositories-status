new Vue({
    el: '#app',
    data () {
      return {
        repositories: [],
        loading: true,
        error: null
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

new Vue({
    el: '#app',
    data () {
      return {
        repositories: [],
        loading: true,
        error: null,
        searchQuery: '',
        showOnlyActive: true,
        loadingProgress: {
            current: 0,
            total: 0,
            percentage: 0
        }
      }
    },
    computed: {
        filteredRepositories() {
            let filtered = this.repositories

            if (this.showOnlyActive) {
                filtered = filtered.filter(repo => repo.open_issues_count > 0)
            }

            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase().trim()
                filtered = filtered.filter(repo => {
                    const name = repo.name ? repo.name.toLowerCase() : ''
                    const description = repo.description ? repo.description.toLowerCase() : ''
                    const topics = repo.topics ? repo.topics.join(' ').toLowerCase() : ''
                    
                    return name.includes(query) || 
                           description.includes(query) || 
                           topics.includes(query)
                })
            }
            return filtered
        },

        repositoryCount() {
            return {
                total: this.repositories.length,
                filtered: this.filteredRepositories.length,
                withActivity: this.repositories.filter(r => r.open_issues_count > 0).length
            }
        },

        statsOverview() {
            const repos = this.filteredRepositories
            return {
                totalIssues: repos.reduce((sum, repo) => sum + repo.open_issues_count, 0),
                totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
                totalForks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
                reposWithIssues: repos.filter(r => r.open_issues_count > 0).length
            }
        }
    },

    methods: {
        clearSearch() {
            this.searchQuery = ''
        },

        toggleActiveFilter() {
            this.showOnlyActive = !this.showOnlyActive
        },
        
        async fetchAllRepositories() {
            try {
                let allRepos = []
                let page = 1
                let hasMore = true
                const perPage = 100

                while (hasMore) {
                    this.loadingProgress.current = page

                    const response = await axios.get(
                        `https://api.github.com/orgs/azerothcore/repos?per_page=${perPage}&page=${page}&sort=updated&direction=desc`
                    )

                    const repos = response.data

                    if (repos.length === 0) {
                        hasMore = false
                    } else {
                        allRepos = allRepos.concat(repos)

                        if (repos.length < perPage) {
                            hasMore = false
                        } else {
                            page++
                        }
                    }

                    this.loadingProgress.percentage = Math.round((allRepos.length / 300) * 100)
                }

                this.repositories = allRepos
                this.error = null

                console.log(`✓ Loaded ${allRepos.length} repositories`)
                console.log(`✓ ${this.repositoryCount.withActivity} repositories with open issues/PRs`)

            } catch (error) {
                console.error('Error fetching repositories:', error)
                if (error.response) {
                    this.error = `Server error: ${error.response.status} - ${error.response.statusText}`
                } else if (error.request) {
                    this.error = 'Network error: Unable to reach GitHub API. Please check your connection.'
                } else {
                    this.error = 'An unexpected error occurred. Please try again later.'
                }
                this.repositories = []
            } finally {
                this.loading = false
            }
        }
    },

    mounted () {
        this.fetchAllRepositories()
    }
})

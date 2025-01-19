$(document).ready(function() {
    const movieSection = {
        // Constants
        API_KEY: '1d19f9a044mshf78c4c3a19981e4p15f483jsn9b94e2d62185',
        API_HOST: 'movies-api14.p.rapidapi.com',
        MOVIES_PER_PAGE: 10,
        UPCOMING_MOVIES_LIMIT: 5,
        UPCOMING_PER_PAGE: 10,

        // Add these properties
        genres: [
            'Action & Adventure', 'Comedy', 'Drama', 'Horror', 
            'Romance', 'Thriller', 'Family', 'Sci-Fi & Fantasy'
        ],

        init() {
            this.page = 1;
            this.movies = [];
            this.currentGenre = 'all';
            this.isLoading = false;
            this.displayedMovies = [];
            this.upcomingMovies = [];
            this.currentFilter = 'all';
            this.isLoadingUpcoming = false;
            this.displayedUpcoming = [];
            
            this.initializeModals();
            this.bindEvents();
            this.fetchMovies();
            this.bindUpcomingEvents();
            this.fetchUpcomingMovies();
        },

        bindEvents() {
            // Genre filter
            $(document).on('click', '.filter-tag', (e) => {
                $('.filter-tag').removeClass('active');
                $(e.currentTarget).addClass('active');
                this.currentGenre = $(e.currentTarget).data('genre');
                this.filterAndDisplayMovies();
            });

            // Load more
            $('#loadMoreBtn').on('click', () => {
                this.loadMore();
            });

            // Search functionality
            $('#findShowsBtn').on('click', () => {
                const searchTerm = $('#movieSearch').val().trim();
                if (searchTerm) {
                    this.searchMovies(searchTerm);
                }
            });

            $('#movieSearch').on('keypress', (e) => {
                if (e.which === 13) {
                    const searchTerm = $('#movieSearch').val().trim();
                    if (searchTerm) {
                        this.searchMovies(searchTerm);
                    }
                }
            });

            // Add movie detail modal handler
            $(document).on('click', '.book-btn', (e) => {
                const movieId = $(e.currentTarget).data('movie-id');
                this.showMovieDetails(movieId);
            });

            $('#movieDetailModal').on('hidden.bs.modal', function () {
                // Remove backdrop when modal is closed
                $('.modal-backdrop').remove();
                // Clear modal content
                $('.movie-detail-content').html('');
            });
        },

        bindUpcomingEvents() {
            // Remove existing event listeners first
            $('.filter-tab').off('click');
            $('.sort-btn').off('click');

            // Add new event listeners
            $('.filter-tab').on('click', (e) => {
                e.preventDefault(); // Prevent default button behavior
                const $target = $(e.currentTarget);
                $('.filter-tab').removeClass('active');
                $target.addClass('active');
                const filter = $target.data('filter');
                this.filterUpcomingMovies(filter);
            });

            $('.sort-btn').on('click', (e) => {
                e.preventDefault(); // Prevent default button behavior
                const $btn = $(e.currentTarget);
                const currentDirection = $btn.data('direction') || 'asc';
                const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
                $btn.data('direction', newDirection);
                
                const $icon = $btn.find('i');
                $icon.toggleClass('fa-sort-amount-down fa-sort-amount-up');
                
                this.sortUpcomingMovies(newDirection);
            });

            // Add load more button event
            $('#upcomingLoadMore').on('click', () => {
                this.loadMoreUpcoming();
            });
        },

        fetchMovies() {
            if (this.isLoading) return;
            this.toggleLoadingState(true);

            const xhr = new XMLHttpRequest();

            xhr.addEventListener('readystatechange', () => {
                if (xhr.readyState === xhr.DONE) {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        this.movies = response.movies;
                        this.initializeFilters();
                        this.filterAndDisplayMovies();
                        
                        if (this.displayedMovies.length >= this.movies.length) {
                            $('#loadMoreBtn').hide();
                        } else {
                            $('#loadMoreBtn').show();
                        }
                    } else {
                        this.showError('Failed to fetch movies');
                    }
                    this.toggleLoadingState(false);
                }
            });

            xhr.open('GET', 'https://movies-api14.p.rapidapi.com/movies');
            xhr.setRequestHeader('x-rapidapi-key', this.API_KEY);
            xhr.setRequestHeader('x-rapidapi-host', this.API_HOST);
            xhr.send();
        },

        filterAndDisplayMovies() {
            let filteredMovies = [...this.movies];
            
            // Apply genre filter
            if (this.currentGenre && this.currentGenre !== 'all') {
                filteredMovies = filteredMovies.filter(movie => 
                    movie.genres.map(g => g.toLowerCase()).includes(this.currentGenre.toLowerCase())
                );
            }

            // Update movie count
            $('#movieCount').text(filteredMovies.length);
            
            // Display filtered movies
            this.displayMovies(filteredMovies);
        },

        updateFilterCounts(movies) {
            // Update count for each genre
            this.genres.forEach(genre => {
                const count = movies.filter(movie => 
                    movie.genres.map(g => g.toLowerCase()).includes(genre.toLowerCase())
                ).length;
                $(`.filter-tag[data-genre="${genre.toLowerCase()}"] .count`).text(`(${count})`);
            });
        },

        loadMore() {
            if (this.filteredMovies) {
                this.displayMovies(this.filteredMovies, true);
            }
        },

        renderMovies(movies) {
            const movieGrid = $('#movieGrid');
            movieGrid.html(movies.map(movie => this.gridTemplate(movie)).join(''));
        },

        getMovieShowtimes(movie) {
            const baseShowtimes = ['10:00 AM', '01:00 PM', '04:00 PM', '07:00 PM', '10:00 PM'];
            const movieIndex = parseInt(movie._id) % baseShowtimes.length;
            return baseShowtimes.slice(movieIndex).concat(baseShowtimes.slice(0, movieIndex));
        },

        toggleLoadingState(isLoading) {
            this.isLoading = isLoading;
            const loadMoreBtn = $('#loadMoreBtn');
            if (isLoading) {
                loadMoreBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Loading...');
            } else {
                loadMoreBtn.prop('disabled', false).html('Load More');
            }
        },

        showError(message) {
            console.error(message);
            $('#movieGrid').html(`<div class="alert alert-danger">${message}</div>`);
        },

        gridTemplate(movie) {
            const showtimes = this.getMovieShowtimes(movie);
            return `
                <div class="movie-card">
                    <div class="movie-poster">
                        <img src="${movie.poster_path}" alt="${movie.title}">
                        <div class="rating">
                            <i class="fas fa-star"></i> ${(Math.random() * 2 + 3).toFixed(1)}
                        </div>
                        <div class="movie-overlay">
                            <div class="movie-info">
                                <h3 class="movie-title">${movie.title}</h3>
                                <div class="movie-meta">
                                    <span><i class="far fa-calendar-alt"></i> ${new Date(movie.release_date).getFullYear()}</span>
                                    <span><i class="fas fa-film"></i> ${movie.genres.join(', ')}</span>
                                </div>
                                <p class="movie-overview">${movie.overview.substring(0, 100)}...</p>
                                <div class="movie-showtimes">
                                    ${showtimes.map(time => `
                                        <button class="showtime-btn ${this.currentShowTime === time ? 'active' : ''}" 
                                                data-time="${time}">
                                            ${time}
                                        </button>
                                    `).join('')}
                                </div>
                                <div class="movie-actions">
                                    <button class="btn btn-outline-light">
                                        <i class="fas fa-play"></i> Trailer
                                    </button>
                                    <button class="btn btn-primary book-btn" data-movie-id="${movie._id}">
                                        <i class="fas fa-ticket-alt"></i> Book
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        fetchUpcomingMovies() {
            if (this.isLoadingUpcoming) return;
            this.isLoadingUpcoming = true;

            const xhr = new XMLHttpRequest();

            xhr.addEventListener('readystatechange', () => {
                if (xhr.readyState === xhr.DONE) {
                    this.isLoadingUpcoming = false;
                    
                    if (xhr.status === 200) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            this.upcomingMovies = response.movies || [];
                            
                            // Initial display of first 10 movies
                            this.displayedUpcoming = this.upcomingMovies.slice(0, this.UPCOMING_PER_PAGE);
                            this.renderUpcomingMovies(this.displayedUpcoming);
                            
                            // Show/hide load more button
                            this.toggleUpcomingLoadMore();
                        } catch (error) {
                            this.handleUpcomingMoviesError('Error processing movie data');
                        }
                    } else {
                        this.handleUpcomingMoviesError('Failed to load movies');
                    }
                }
            });

            xhr.open('GET', 'https://movies-api14.p.rapidapi.com/movies');
            xhr.setRequestHeader('x-rapidapi-key', this.API_KEY);
            xhr.setRequestHeader('x-rapidapi-host', this.API_HOST);
            xhr.send();
        },

        handleUpcomingMoviesError(message) {
            $('.coming-soon-grid').html(`
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${message}</p>
                    <button class="retry-btn" onclick="movieSection.fetchUpcomingMovies()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `);
            $('#upcomingCount').text('0');
        },

        filterUpcomingMovies(filter = 'all') {
            let filteredMovies = [...this.upcomingMovies];
            
            // Apply filters if needed
            if (filter !== 'all') {
                const today = new Date();
                const currentMonth = today.getMonth();
                const nextMonth = (currentMonth + 1) % 12;
                
                filteredMovies = filteredMovies.filter(movie => {
                    const releaseDate = new Date(movie.release_date);
                    const movieMonth = releaseDate.getMonth();
                    
                    if (filter === 'this-month') {
                        return movieMonth === currentMonth;
                    } else if (filter === 'next-month') {
                        return movieMonth === nextMonth;
                    }
                    return true;
                });
            }

            this.renderUpcomingMovies(filteredMovies);
        },

        renderUpcomingMovies(movies) {
            const grid = $('.coming-soon-grid');
            
            if (!movies || movies.length === 0) {
                grid.html('<div class="no-movies">No movies found</div>');
                return;
            }

            const moviesHTML = movies.map(movie => `
                <div class="coming-soon-card">
                    <div class="movie-poster">
                        <img src="${movie.poster_path}" alt="${movie.title}">
                        <div class="release-badge">
                            <span class="month">${getMonth(movie.release_date)}</span>
                            <span class="date">${getDay(movie.release_date)}</span>
                            <span class="year">${getYear(movie.release_date)}</span>
                        </div>
                        <div class="overlay-content">
                            <div class="movie-info">
                                <div class="genre-tags">
                                    ${movie.genres.map(genre => `<span>${genre}</span>`).join('')}
                                </div>
                                <h3>${movie.title}</h3>
                                <p class="overview">${movie.overview.substring(0, 100)}...</p>
                                <div class="movie-meta">
                                    <span><i class="fas fa-clock"></i> 2h 15m</span>
                                    <span><i class="fas fa-star"></i> Expected 4.5</span>
                                </div>
                                <div class="action-buttons">
                                    <button class="btn-trailer">
                                        <i class="fas fa-play"></i> Watch Trailer
                                    </button>
                                    <button class="btn-notify">
                                        <i class="fas fa-bell"></i> Get Notified
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            grid.html(moviesHTML);
            $('#upcomingCount').text(movies.length);
        },

        loadMoreUpcoming() {
            const currentCount = this.displayedUpcoming.length;
            const nextBatch = this.upcomingMovies.slice(
                currentCount,
                currentCount + this.UPCOMING_PER_PAGE
            );
            
            if (nextBatch.length > 0) {
                this.displayedUpcoming = [...this.displayedUpcoming, ...nextBatch];
                this.renderUpcomingMovies(this.displayedUpcoming);
                this.toggleUpcomingLoadMore();
            }
        },

        toggleUpcomingLoadMore() {
            const loadMoreBtn = $('#upcomingLoadMore');
            if (this.displayedUpcoming.length < this.upcomingMovies.length) {
                loadMoreBtn.show();
            } else {
                loadMoreBtn.hide();
            }
        },

        searchMovies(term) {
            if (!term.trim()) return;
            
            const xhr = new XMLHttpRequest();

            xhr.addEventListener('readystatechange', () => {
                if (xhr.readyState === xhr.DONE) {
                    if (xhr.status === 200) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            this.renderSearchResults(response.contents || []);
                        } catch (error) {
                            console.error('Error parsing search results:', error);
                            this.renderSearchResults([]);
                        }
                    } else {
                        console.error('Search request failed');
                        this.renderSearchResults([]);
                    }
                }
            });

            // Show loading state
            const resultsContainer = $('#searchResults');
            resultsContainer.html('<div class="text-center p-4"><i class="fas fa-spinner fa-spin fa-2x"></i><p class="mt-2">Searching...</p></div>');

            // Show modal
            const searchModal = document.getElementById('searchModal');
            if (searchModal) {
                const modal = new bootstrap.Modal(searchModal);
                modal.show();
            }

            xhr.open('GET', `https://movies-api14.p.rapidapi.com/search?query=${encodeURIComponent(term)}`);
            xhr.setRequestHeader('x-rapidapi-key', this.API_KEY);
            xhr.setRequestHeader('x-rapidapi-host', this.API_HOST);
            xhr.send();
        },

        renderSearchResults(results) {
            const resultsContainer = $('#searchResults');
            
            if (!Array.isArray(results) || results.length === 0) {
                resultsContainer.html(`
                    <div class="text-center p-4">
                        <i class="fas fa-search fa-2x mb-3"></i>
                        <p>No movies found. Try a different search term.</p>
                    </div>
                `);
                return;
            }

            const html = results.map(movie => `
                <div class="search-result-card">
                    <div class="search-result-poster">
                        <img src="${movie.poster_path}" 
                             alt="${movie.title}" 
                             onerror="this.src='images/no-poster.jpg'">
                    </div>
                    <div class="search-result-content">
                        <h3 class="search-result-title">${movie.title}</h3>
                        <div class="search-result-meta">
                            <div class="meta-item">
                                <i class="fas fa-star"></i>
                                <span>${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-calendar"></i>
                                <span>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</span>
                            </div>
                        </div>
                        <div class="search-result-overview">
                            ${movie.overview ? 
                              (movie.overview.length > 150 ? 
                               movie.overview.substring(0, 150) + '...' : 
                               movie.overview) : 
                              'No overview available'}
                        </div>
                        <div class="search-result-actions">
                            <button class="btn btn-sm btn-primary book-btn" data-movie-id="${movie._id}">
                                <i class="fas fa-ticket-alt"></i> Book Now
                            </button>
                            ${movie.youtube_trailer ? `
                                <button class="btn btn-sm btn-outline-light trailer-btn" 
                                        data-trailer="${movie.youtube_trailer}">
                                    <i class="fas fa-play"></i> Trailer
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('');

            resultsContainer.html(html);
            $('#searchResults').addClass('search-results-grid');
        },

        initializeModals() {
            if (!document.getElementById('searchModal')) {
                const modalHTML = `
                    <div class="modal fade" id="searchModal" tabindex="-1" aria-labelledby="searchModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="searchModalLabel">Search Results</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <div id="searchResults" class="search-results-grid">
                                        <!-- Results will be loaded here -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', modalHTML);
            }
        },

        initializeFilters() {
            const genreFilters = $('.genre-filters');
            genreFilters.html(`
                <button class="filter-tag active" data-genre="all">
                    <i class="fas fa-film"></i> All Genres
                    <span class="count">(${this.movies.length})</span>
                </button>
                ${this.genres.map(genre => `
                    <button class="filter-tag" data-genre="${genre.toLowerCase()}">
                        <i class="${this.getGenreIcon(genre)}"></i>
                        <span>${genre}</span>
                        <span class="count">(0)</span>
                    </button>
                `).join('')}
            `);
            this.updateFilterCounts(this.movies);
        },

        getGenreIcon(genre) {
            const icons = {
                'Action': 'fas fa-fire',
                'Adventure': 'fas fa-mountain',
                'Animation': 'fas fa-child',
                'Comedy': 'fas fa-laugh',
                'Crime': 'fas fa-mask',
                'Drama': 'fas fa-theater-masks',
                'Family': 'fas fa-users',
                'Fantasy': 'fas fa-hat-wizard',
                'Horror': 'fas fa-ghost',
                'Romance': 'fas fa-heart',
                'Sci-Fi': 'fas fa-robot',
                'Thriller': 'fas fa-exclamation'
            };
            return icons[genre] || 'fas fa-film';
        },

        displayMovies(movies, append = false) {
            const movieGrid = $('#movieGrid');
            const loadMoreBtn = $('#loadMoreBtn');
            
            // Store filtered movies for load more functionality
            this.filteredMovies = movies;
            
            if (!movies || movies.length === 0) {
                movieGrid.html(`
                    <div class="no-results">
                        <i class="fas fa-film fa-3x"></i>
                        <p>No movies found matching your filters</p>
                    </div>
                `);
                loadMoreBtn.hide();
                return;
            }

            // Calculate start and end indices
            const start = append ? this.displayedMovies.length : 0;
            const end = start + this.MOVIES_PER_PAGE;
            const moviesToShow = movies.slice(start, end);

            const html = moviesToShow.map(movie => `
                <div class="movie-card">
                    <div class="movie-poster">
                        <img src="${movie.poster_path}" alt="${movie.title}">
                        <div class="movie-overlay">
                            <div class="movie-info">
                                <div class="genre-tags">
                                    ${movie.genres.map(genre => `
                                        <span class="genre-pill">${genre}</span>
                                    `).join('')}
                                </div>
                                <h3>${movie.title}</h3>
                                <p class="overview">${movie.overview.substring(0, 100)}...</p>
                                <div class="movie-meta">
                                    <span><i class="fas fa-star"></i> ${movie.vote_average}</span>
                                    <span><i class="fas fa-calendar"></i> ${movie.release_date.split('-')[0]}</span>
                                </div>
                                <div class="movie-actions">
                                    <button class="btn btn-outline-light">
                                        <i class="fas fa-play"></i> Trailer
                                    </button>
                                    <button class="btn btn-primary book-btn" data-movie-id="${movie._id}">
                                        <i class="fas fa-ticket-alt"></i> Book
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            if (append) {
                movieGrid.append(html);
                this.displayedMovies = [...this.displayedMovies, ...moviesToShow];
            } else {
                movieGrid.html(html);
                this.displayedMovies = moviesToShow;
            }

            // Show/hide load more button
            if (this.displayedMovies.length < movies.length) {
                loadMoreBtn.show();
            } else {
                loadMoreBtn.hide();
            }

            this.updateFilterCounts(movies);
        },

        showMovieDetails(movieId) {
            // First remove any existing backdrop
            $('.modal-backdrop').remove();
            
            const modal = new bootstrap.Modal(document.getElementById('movieDetailModal'));
            const modalContent = $('.movie-detail-content');
            
            // Show loading state
            modalContent.html('<div class="text-center p-4"><i class="fas fa-spinner fa-spin fa-2x"></i></div>');
            modal.show();

            // Fetch movie details
            const xhr = new XMLHttpRequest();
            xhr.addEventListener('readystatechange', () => {
                if (xhr.readyState === xhr.DONE) {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        // Check if response.movie exists, as the API returns { movie: { ... } }
                        const movie = response.movie || response;
                        modalContent.html(this.getMovieDetailTemplate(movie));
                        
                        // Store the movie data in the modal for later use
                        $('#movieDetailModal').data('movieData', movie);
                    } else {
                        modalContent.html('<div class="alert alert-danger">Failed to load movie details</div>');
                    }
                }
            });

            xhr.open('GET', `https://movies-api14.p.rapidapi.com/movie/${movieId}`);
            xhr.setRequestHeader('x-rapidapi-key', this.API_KEY);
            xhr.setRequestHeader('x-rapidapi-host', this.API_HOST);
            xhr.send();
        },

        getMovieDetailTemplate(movie) {
            // Add null checks and default values
            const genres = movie.genres || [];
            const vote_average = movie.vote_average || 'N/A';
            const release_date = movie.release_date || 'TBA';
            
            return `
                <div class="movie-detail-layout">
                    <div class="movie-detail-poster">
                        <img src="${movie.poster_path || ''}" alt="${movie.title || 'Movie Poster'}">
                    </div>
                    <div class="movie-detail-info">
                        <h2>${movie.title || 'Movie Title'}</h2>
                        <div class="meta-info">
                            <span><i class="fas fa-star"></i> ${vote_average}</span>
                            <span><i class="fas fa-calendar"></i> ${release_date}</span>
                        </div>
                        <div class="genre-tags">
                            ${genres.map(genre => `
                                <span class="genre-pill">${genre}</span>
                            `).join('')}
                        </div>
                        <p class="overview">${movie.overview || 'No overview available.'}</p>
                        
                        <!-- Add AI Summary Button -->
                        <button class="btn btn-outline-primary ai-summary-btn" data-movie-id="${movie._id}">
                            <i class="fas fa-robot"></i> Get AI Summary
                        </button>
                        <div class="ai-summary-container" style="display: none;">
                            <div class="ai-summary-content"></div>
                        </div>
                        
                        <div class="booking-section">
                            <h4>Select Showtime</h4>
                            <div class="showtime-grid">
                                ${this.getShowtimes().map(time => `
                                    <button class="showtime-btn" data-time="${time}">
                                        ${time}
                                    </button>
                                `).join('')}
                            </div>
                            <button class="btn btn-primary btn-block mt-4 proceed-booking">
                                <i class="fas fa-ticket-alt"></i> Proceed to Booking
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        getShowtimes() {
            return [
                '10:00 AM', '12:30 PM', '3:00 PM', 
                '5:30 PM', '8:00 PM', '10:30 PM'
            ];
        }
    };

    // Initialize when document is ready
    movieSection.init();

    // FAQ Functionality
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                const icon = item.querySelector('.toggle-icon i');
                icon.className = 'fas fa-plus';
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
                const icon = question.querySelector('.toggle-icon i');
                icon.className = 'fas fa-minus';
            }
        });
    });

    // Form Validation
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            contactForm.reset();
        });
    }

    // Animate Statistics
    function animateStats() {
        const stats = document.querySelectorAll('.stat-number');
        
        stats.forEach(stat => {
            const target = parseInt(stat.dataset.value);
            const duration = 2000; // 2 seconds
            const step = target / duration * 10; // Update every 10ms
            let current = 0;
            
            const updateStat = () => {
                if (current < target) {
                    current += step;
                    if (current > target) current = target;
                    stat.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateStat);
                }
            };
            
            updateStat();
        });
    }

    // Trigger animation when section is in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                observer.unobserve(entry.target);
            }
        });
    });

    const aboutSection = document.querySelector('.about-section');
    if (aboutSection) {
        observer.observe(aboutSection);
    }

    // Add new function to handle AI summary
    async function getAiSummary(movieData) {
        const prompt = `Please provide a concise and engaging summary of the following movie:
        Title: ${movieData.title}
        Overview: ${movieData.overview}
        Genre: ${movieData.genres.join(', ')}
        Release Date: ${movieData.release_date}
        
        Please include:
        1. A brief plot summary
        2. Key themes or elements
        3. What makes this movie unique or interesting
        
        Keep the response under 150 words and make it engaging for potential viewers.`;

        const formData = new FormData();
        formData.append('input-field', prompt);
        formData.append('fileid', '2ce20ca20a9ff3d88c9f0467d96c4b13d00ae946');

        try {
            const response = await fetch('https://www.bmreducation.com/screenscape/ai', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error getting AI summary:', error);
            throw error;
        }
    }

    // Add event listener for AI summary button
    $(document).on('click', '.ai-summary-btn', function() {
        const button = $(this);
        
        try {
            // Get movie data from the modal
            const movie = $('#movieDetailModal').data('movieData');
            
            if (!movie) {
                throw new Error('Movie data not found');
            }
            
            // Construct a comprehensive prompt for the chatbot
            const prompt = `movie - Provide an engaging analysis of "${movie.title}":

🎬 Movie Details:
• Title: ${movie.title}
• Genre: ${movie.genres ? movie.genres.join(', ') : 'N/A'}
• Release: ${movie.release_date || 'N/A'}
• Rating: ${movie.vote_average || 'N/A'}/10

Please analyze this film considering:
1. Plot Overview & Unique Elements
2. Themes & Artistic Direction
3. Target Audience & Appeal
4. Cultural Impact & Significance
5. Notable Performances & Technical Aspects
6. Who Would Enjoy This Film

Format your response with clear sections and emojis for better readability.`;

            // Use the chat interface
            $('#userInput').val(prompt);
            $("#sendBtn").click();
            $("#chatToggle").click();
            
            // Update button state
            button.html('<i class="fas fa-robot"></i> Get New Analysis');
            
        } catch (error) {
            console.error('Error generating analysis:', error);
            // Show error in chat if needed
            $('#userInput').val('Error analyzing movie. Please try again.');
            $("#sendBtn").click();
        }
    });
});

function getDay(dateString) {
    // Parse the date string
    const date = new Date(dateString);

    // Extract the day and month
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed, so add 1

    return day
}
function getMonth(dateString) {
    // Parse the date string
    const date = new Date(dateString);

    // Get month as 3-letter abbreviation
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[date.getMonth()];
}
function getYear(dateString) {
    // Parse the date string
    const date = new Date(dateString);

    // Get full year
    return date.getFullYear();
}
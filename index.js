//config：修改以下部分

var sentry_dsn = "https://6f4cfc1a19be46efbdb2e412e307339e@o4504512193101824.ingest.sentry.io/4504512392265728"


// 以下部分请勿改动

function getCookie(name) {
    // 拆分 cookie 字符串
    var cookieArr = document.cookie.split(";");

    // 循环遍历数组元素
    for (var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");

        /* 删除 cookie 名称开头的空白并将其与给定字符串进行比较 */
        if (name == cookiePair[0].trim()) {
            // 解码cookie值并返回
            return decodeURIComponent(cookiePair[1]);
        }
    }
    // 如果未找到，则返回null
    return null;
}

const app = Vue.createApp({
    data() {
        return {
            apis_json: '',
            inprogress: false,
            languages: {},
            current_language: "",
            language: {},
            api: {},
            apis: [],
            search_result: [],
            detail: {},
            keyword: '',
            hits: 0,
            page: 1,
        }
    },
    methods: {
        changeapi(api) {
            this.api = api
        },

        change_language(lan) {
            this.language = lan.setting
        },

        search() {
            this.page = 1;
            this.inprogress = true;
            axios.post(this.api.url + '/api/search/', {
                keyword: this.keyword,
                page: this.page,
                sensitive: this.api.sensitive,
            }).then(response => {
                if (response.data.errorn) {
                    alert(response.data.msg)
                }
                else {
                    this.search_result = response.data.data
                    if (response.data.data.length == 0) {
                        alert('无相关结果')
                    }
                    this.hits = response.data.hits
                }
            }).catch(error => {
                if (error.toJSON().status == 429) {
                    alert('请求过于频繁，请稍等一下再次尝试(429)')
                }
                else {
                    alert(`未知错误，请打开控制台查看(${error.message})`)
                }
            })
            this.inprogress = false;
        },

        change_page(change) {
            this.page += change
            axios.post(this.api.url + '/api/search/', {
                keyword: this.keyword,
                page: this.page,
                sensitive: this.api.sensitive,
            }).then(response => {
                this.search_result = response.data.data
            }).catch(error => {
                if (error.toJSON().status == 429) {
                    alert('请求过于频繁，请稍等一下再次尝试(429)')
                }
                else {
                    alert(`未知错误，请打开控制台查看(${error.message})`)
                }
            })
        },

        get_detail(item) {
            if (this.api.detail) {
                axios.post(this.api.url + '/api/detail/', {
                    id: item.id,
                    source: item.source
                }).then(response => {
                    if (response.data.errorn) {
                        alert(response.data.msg)
                    }
                    else {
                        this.detail = response.data
                    }

                }).catch(error => {
                    if (error.toJSON().status == 429) {
                        alert('请求过于频繁，请稍等一下再次尝试(429)')
                    }
                    else {
                        alert(`未知错误，请打开控制台查看(${error.message})`)
                    }
                })
            }
            else {
                this.detail = item;
            }
            var myModal = new bootstrap.Modal(document.getElementById('detailModal'), {})
            myModal.toggle()
        },

        filesizeToString(filesize) {
            if (filesize > 0 && filesize < 1) {
                return (filesize * 8).toFixed(2).toString() + 'b'
            } else if (filesize <= 1024) {
                return filesize.toFixed(2).toString() + 'B'
            } else if (filesize <= Math.pow(1024, 2)) {
                return (filesize / 1024).toFixed(2).toString() + 'KB'
            } else if (filesize <= Math.pow(1024, 3)) {
                return (filesize / Math.pow(1024, 2)).toFixed(2).toString() + 'MB'
            }
        }

    },
    computed: {
        is_homepage() {
            return location.pathname == '/'
        },
        noapi() {
            return this.apis.length == 0
        },
        total_page() {
            return Math.floor(this.hits / 20) + 1
        },
    },
    mounted: function () {
        axios.get('./i18n.json').then(response => {
            this.languages = response.data
            this.apis_json = location.search
            try {
                this.apis = JSON.parse(decodeURI(location.search.slice(1)));
                this.api = this.apis[0]
            }
            catch(err) {
                this.apis = []
            }
            this.apis = JSON.parse(decodeURI(location.search.slice(1)));
            this.api = this.apis[0]
            this.current_language = (navigator.language || navigator.browserLanguage).toLowerCase()
            try {
                this.language = this.languages[this.current_language].setting
            }
            catch(err) {
                this.current_language = 'en-us'
                this.language = this.languages[this.current_language].setting
            }
            if (location.hash.slice(1)) {
                this.keyword = decodeURI(location.hash.slice(1));
                this.search()
            }
        })
    }
})

app.mount('#app')

Sentry.init({
    dsn: sentry_dsn,
});

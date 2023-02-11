//config：修改以下部分

var sentry_dsn = "https://6f4cfc1a19be46efbdb2e412e307339e@o4504512193101824.ingest.sentry.io/4504512392265728"
var prefix = { "ipfs": "https://ipfs-checker.1kbtool.com/", "ru": "https://rulite.1kbtool.com/", "libgen": "http://libgendown.1kbtool.com/" }

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
            show_notice: true,
            apis_json: '',
            languages: {},
            current_language: "",
            language: {},
            api: {},
            apis: [],
            search_result: [],
            detail: {},
            keyword: '',
            enhanced: false,
            displayimg: false
        }
    },
    methods: {
        get_prefix(name) {
            if (this.api['prefix'] && this.api['prefix'][name]) {
                return this.api['prefix'][name]
            } else {
                return prefix[name]
            }
        },

        changeapi(api) {
            this.api = api
        },

        change_language(lan) {
            this.language = lan.setting
        },

        handle_error(error) {
            if (error.toJSON().status == 429) {
                alert('请求过于频繁，请稍等一下再次尝试(429)')
            }
            else {
                alert(`未知错误，请打开控制台查看(${error.message})`)
            }
        },

        single_search(api,change) {
            api.inprogress = true
            if(change){
                api.page += change
            }else{
                api.page = 1;
            }
            
            // api.inprogress = true;
            axios.post(api.url + '/api/search/', {
                keyword: this.keyword,
                page: api.page,
                sensitive: api.sensitive,
            }).then(response => {
                api.inprogress = false
                if (response.data.errorn) {
                    alert(response.data.msg)
                }
                else {
                    api.search_result = response.data.data
                    api.search_result.forEach(result => {
                        result.sizestring = this.filesizeToString(result.filesize)
                    });
                    api.hits = response.data.hits
                    api.total_page = Math.floor(api.hits / 20) + 1
                    api.noresult = (response.data.data.length == 0)
                }
            }).catch(error => {
                this.handle_error(error)
            })
            // api.inprogress = false;
        },

        search(){
            this.show_notice = false
            if(this.enhanced){
                this.apis.forEach(api => {
                    this.single_search(api)
                });
            }else{
                this.single_search(this.api)
            }
        },

        get_detail(api,item) {
            this.api = api
            if (api.detail) {
                axios.post(api.url + '/api/detail/', {
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
                    this.handle_error(error)
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
        },
    },

    mounted() {
        axios.get('./i18n.json').then(response => {
            this.languages = response.data
            this.current_language = (navigator.language || navigator.browserLanguage).toLowerCase()
            try {
                this.language = this.languages[this.current_language].setting
            }
            catch (err) {
                this.current_language = 'en-us'
                this.language = this.languages[this.current_language].setting
            }
        })
    },
    created() {
        this.apis_json = location.search
        try {
            this.apis = JSON.parse(decodeURI(location.search.slice(1)));
            this.api = this.apis[0]
        }
        catch (err) {
            this.apis = []
        }
        if (location.hash.slice(1)) {
            this.keyword = decodeURI(location.hash.slice(1));
            this.search()
        }


    },
    components:{
        "single-result":{
            template:'#single-result-template',
            props: ['api','language','displayimg'],
        }
    },
})

app.mount('#app')

Sentry.init({
    dsn: sentry_dsn,
});


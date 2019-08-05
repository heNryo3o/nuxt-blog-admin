import request from '@/utils/request'

export function getList(data) {
  return request({
    url: '/news/news-list',
    method: 'get',
    params: data
  })
}

export function getNewsCateOptions() {
  return request({
    url: '/news/news-cate-options',
    method: 'get'
  })
}

export function editNews(data) {
  return request({
    url: '/news/edit-news',
    method: 'post',
    data
  })
}

export function getNews(data) {
  return request({
    url: '/news/change-status',
    method: 'post',
    data
  })
}

export function setSticky(data) {
  return request({
    url: '/news/set-sticky',
    method: 'post',
    data
  })
}

export function deleteNews(data) {
  return request({
    url: '/news/delete-news',
    method: 'post',
    data
  })
}

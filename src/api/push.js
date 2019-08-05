import request from '@/utils/request'

export function getTemplateList(data) {
  return request({
    url: '/push/template-list',
    method: 'get',
    params: data
  })
}

export function changeStatus(data) {
  return request({
    url: '/push/change-status',
    method: 'post',
    data
  })
}

export function deleteTemplate(data) {
  return request({
    url: '/push/delete-template',
    method: 'post',
    data
  })
}

export function moduleOptions() {
  return request({
    url: '/push/module-options',
    method: 'get'
  })
}

export function adminOptions() {
  return request({
    url: '/push/admin-options',
    method: 'get'
  })
}

export function editTemplate(data) {
  return request({
    url: '/push/edit-template',
    method: 'post',
    data
  })
}

export function getPushLogs(data) {
  return request({
    url: '/push/push-logs',
    method: 'get',
    params: data
  })
}

export function getTypeOptions(data) {
  return request({
    url: '/push/type-options',
    method: 'get'
  })
}

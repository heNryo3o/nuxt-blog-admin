import request from '@/utils/request'

export function getPermissions(data) {
  return request({
    url: '/permission/permission-list',
    method: 'get',
    params: data
  })
}

export function getPermissionParentOptions() {
  return request({
    url: '/permission/permission-parent-options',
    method: 'get'
  })
}

export function editPermission(data) {
  return request({
    url: '/permission/edit-permission',
    method: 'post',
    data
  })
}

export function changeStatus(data) {
  return request({
    url: '/permission/change-status',
    method: 'post',
    data
  })
}

export function deletePermission(data) {
  return request({
    url: '/permission/delete-permission',
    method: 'post',
    data
  })
}

export function getPermissionOptions() {
  return request({
    url: '/permission/permission-options',
    method: 'get',
  })
}

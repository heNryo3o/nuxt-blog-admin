import request from '@/utils/request'

export function getRoles(data) {
  return request({
    url: '/role/role-list',
    method: 'get',
    params: data
  })
}

export function editRole(data) {
  return request({
    url: '/role/edit-role',
    method: 'post',
    data
  })
}

export function changeStatus(data) {
  return request({
    url: '/role/change-status',
    method: 'post',
    data
  })
}

export function deleteRole(data) {
  return request({
    url: '/role/delete-role',
    method: 'post',
    data
  })
}

export function getRoleOptions() {
  return request({
    url: '/role/role-options',
    method: 'get'
  })
}

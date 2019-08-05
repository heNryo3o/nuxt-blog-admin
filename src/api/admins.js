import request from '@/utils/request'

export function getList(data) {
  return request({
    url: '/admin/admin-list',
    method: 'get',
    params: data
  })
}

export function getDepartmentOptions() {
  return request({
    url: '/admin/department-options',
    method: 'get'
  })
}

export function editAdmin(data) {
  return request({
    url: '/admin/edit-admin',
    method: 'post',
    data
  })
}

export function changeStatus(data) {
  return request({
    url: '/admin/change-status',
    method: 'post',
    data
  })
}

export function deleteAdmin(data) {
  return request({
    url: '/admin/delete-admin',
    method: 'post',
    data
  })
}

export function getAdminPermissions(data) {
  return request({
    url: '/admin/admin-permissions',
    method: 'get',
    params: data
  })
}

export function setAdminPermissions(data) {
  return request({
    url: '/admin/set-permissions',
    method: 'post',
    data
  })
}


import {apiFetch} from "./apifetch";
export async function Student() {
  return apiFetch("/auth/users/students/", {
    method: "GET",
  });
}

export async function Teacher() {
  return apiFetch("/auth/users/teachers/", {
    method: "GET",
  });
}
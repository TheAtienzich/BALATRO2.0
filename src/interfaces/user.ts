export interface LoginData {
  email: string;
  password: string;
  lat?: number;
  lng?: number;
}

export interface RegisterData extends LoginData {
  name: string;
  photo: string;
}

export interface User extends Omit<RegisterData, "password"> {
  id: number;
  lat: number;
  lng: number;
  me: boolean;
  photo: string;
}

export interface UserProfileEdit {
  name: string;
  email: string;
}

export interface UserPhotoEdit {
  photo: string;
}

export interface UserPasswordEdit {
  password: string;
}

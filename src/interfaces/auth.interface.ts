export interface Register {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
}

export interface Login {
    email: string;
    password: string;
}

export interface Register {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    ip_address?: string;
}

export interface Login {
    email: string;
    password: string;
}

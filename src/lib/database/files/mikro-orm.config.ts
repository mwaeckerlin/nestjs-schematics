import {MikroOrmConfig} from "@scrypt-swiss/nest"

export default MikroOrmConfig(__dirname, '<%= name.toUpperCase().replace(/-/g, "_") %>')

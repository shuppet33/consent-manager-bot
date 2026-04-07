import {db} from "../db/connect";
import {store, userRoleAtom} from "../store";


export const getRole = async (userId: number | undefined) => {
    if (!userId) return;

    const response = await db.query('SELECT * FROM users WHERE telegram_id = $1', [userId]);
    const role = response.rows[0].role

    store.set(userRoleAtom, role)

    return role
}
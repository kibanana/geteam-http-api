export default interface UpdateNotifications {
    _id?: string;
    notifications: { applied?: boolean, accepted?: boolean, team?: boolean };
}

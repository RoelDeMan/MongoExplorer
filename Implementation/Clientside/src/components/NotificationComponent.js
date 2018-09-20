import {notification} from 'antd';

export function Notification(type, title, description, duration) {
    notification[type]({
        message: title,
        description: description,
        duration: duration
    });
}
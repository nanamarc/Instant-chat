/**
 * Date utility functions
 */
class DateUtils {
    static formatTime(date) {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);
    }

    static formatDateTime(date) {
        const now = new Date();
        const messageDate = new Date(date);
        
        // If today, show only time
        if (this.isSameDay(now, messageDate)) {
            return this.formatTime(messageDate);
        }
        
        // If yesterday, show "Yesterday"
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (this.isSameDay(yesterday, messageDate)) {
            return `Yesterday ${this.formatTime(messageDate)}`;
        }
        
        // If this year, show month and day
        if (now.getFullYear() === messageDate.getFullYear()) {
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(messageDate);
        }
        
        // Show full date
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(messageDate);
    }

    static isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    static getCurrentDateTime() {
        return new Date().toISOString();
    }
}

window.DateUtils = DateUtils;
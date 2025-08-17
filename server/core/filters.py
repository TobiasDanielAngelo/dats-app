import logging

poll_counter = 0


class SkipPollingFilter(logging.Filter):
    def filter(self, record):
        global poll_counter
        msg = str(record.args)  # The HTTP request line
        if "check_last_updated=" in msg:
            poll_counter += 1
            if poll_counter % 20 == 1:
                print(f"This suppresses 19 out of 20 request polling messages.")
            return poll_counter % 20 == 1
        return True

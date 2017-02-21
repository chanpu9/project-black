""" Keeps class with the interfaces that are pulled by worker
to manager the launched instance of scan. """
from selenium import webdriver

from black.models import Scan

from black.workers.common.task import Task
from .screenshot_maker import make_screenshot


class ScreenshotterTask(Task):
    """ Major class for working with selenium """

    def __init__(self, task_id, command, project_name):
        Task.__init__(self, task_id, command, project_name)
        self.status = "New"
        self.result = None

    def start(self):
        """ Launch the task and readers of stdout, stderr """
        self.status = "Working"
        print("Starting work")
        print(self.command)
        protocol = self.command["protocol"] or 'http:'
        hostname = self.command["hostname"]
        port = self.command["port"] or 80
        path = self.command["path"] or '/'
        self.result = make_screenshot(
            protocol + "//" + hostname + ":" + str(port) + path,
            "black/screenshots/" + self.task_id)

        print("Finished work")

    def send_notification(self, command):
        """ Sendms 'command' notification to the current process. """
        if command == 'pause':
            pass
        elif command == 'stop':
            pass
        elif command == 'unpause':
            pass

    def wait_for_exit(self):
        """ Check if the process exited. If so,
        save stdout, stderr, exit_code and update the status. """
        if self.result['success']:
            self.status = "Finished"
            self.save()
        else:
            self.status = "Aborted"

    def save(self):
        """ Save the information to the DB. """
        # TODO: wait, wait, at which position should i save the picture?
        # Meaning, if we rescan, should save to the last one?
        found_data = Scan()

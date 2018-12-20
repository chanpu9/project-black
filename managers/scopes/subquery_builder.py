from sqlalchemy import desc, or_, and_
from sqlalchemy.orm import aliased, contains_eager
from sqlalchemy.sql.expression import func

from black.db import ScanDatabase, FileDatabase
from managers.scopes.filters import Filters


class SubqueryBuilder:
    @staticmethod
    def build_scans_subquery(session, project_uuid, filters):
        # Create a list of filters which will be applied against scans
        scans_filters = Filters.build_scans_filters(
            filters, ScanDatabase
        )

        scans_selected = (
            session.query(
                ScanDatabase
            ).filter(
                ScanDatabase.project_uuid == project_uuid,
                scans_filters
            ).subquery()
        )

        return scans_selected

    @staticmethod
    def build_files_subquery(session, project_uuid, filters):
        """ Creates a query for selection unique,
        ordered and filtered files """

        # Select distinc files, let's select unique tuples
        #   (file_path, status_code, content_length)
        subq = (
            session.query(
                FileDatabase
            )
            .filter(FileDatabase.project_uuid == project_uuid)
            .subquery('project_files_ordered')
        )
        alias_ordered = aliased(FileDatabase, subq)
        ordered = session.query(alias_ordered)

        # Create a list of filters which will be applied against scans
        files_filters = Filters.build_files_filters(
            filters, alias_ordered, project_uuid=project_uuid)

        # Use filters
        files_from_db = (
            ordered
            .filter(files_filters)
            .subquery('files_distinct_filtered')
        )

        return files_from_db

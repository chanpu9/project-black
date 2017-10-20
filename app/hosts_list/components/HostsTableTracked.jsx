import React from 'react'

import ScopesSocketioEventsEmitter from '../../redux/scopes/ScopesSocketioEventsEmitter.js'

import HostsTable from './HostsTable.jsx'

class HostsTableTracked extends React.Component {

	constructor(props) {
		super(props);

		this.scopesEmitter = new ScopesSocketioEventsEmitter();		

		this.deleteScope = this.deleteScope.bind(this);
	}

	deleteScope(scope_id) {
		this.scopesEmitter.requestDeleteScope(scope_id, this.props.project.project_uuid);
	}

	render() {
		return (
			<HostsTable project={this.props.project}
						hosts={this.props.scopes}
						onFilterChange={this.props.onFilterChange}
						deleteScope={this.deleteScope}

						scans={this.props.scans} />
		)
	}

}


export default HostsTableTracked;

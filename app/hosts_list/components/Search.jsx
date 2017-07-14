import _ from 'lodash'
import React from 'react'
import Select from 'react-select'
import { Button } from 'react-bootstrap'


function splice(oldStr, start, delCount, newSubStr) {
	const intStart = parseInt(start);
    return oldStr.slice(0, intStart) + newSubStr + oldStr.slice(intStart + Math.abs(delCount));
};

class Search extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			multiValue: [],
			options: [
				{ value: 'host: *.ya.ru', label: 'host: *.ya.ru' },
				{ value: 'ip: 8.8.8.8', label: 'ip: 8.8.8.8' },
				{ value: 'port: 80', label: 'port: 80' },
				{ value: 'banner: apache', label: 'banner: apache' }
			]
		}

		this.handleOnChange = this.handleOnChange.bind(this);
		this.parseActiveOptions = this.parseActiveOptions.bind(this);
	}

	handleOnChange(value) {
		this.setState({ multiValue: value });

		setTimeout(this.parseActiveOptions, 100);
	}

	parseActiveOptions() {
		const { multiValue } = this.state;
		var resultObject = {};

		for (var eachValue of multiValue) {
			const unparsedOptions = eachValue.value;
			const splitted = unparsedOptions.split(":");

			const key = splitted[0].trim();
			const value = splitted[1].trim();

			if (_.has(resultObject, key)) {
				resultObject[key].push(value);
			}
			else {
				resultObject[key] = [value];
			}
		}

		var regexes = {};
		for (var eachParam of Object.keys(resultObject)) {
			regexes[eachParam] = [];

			const value = resultObject[eachParam];

			var negativeOptions = [];

			for (var eachWord of value) {
				// Replace start in regexes
				var toRemove = [];
				var escaped = false;

				for (var i in eachWord) {
					const eachChar = eachWord[i];

					if ((eachChar == '*') && (!escaped)) {
						toRemove.push(parseInt(i));
					}
					else if (eachChar == '\\') {
						escaped = true;
					}
				}

				var replacedStar = eachWord;

				for (var subIndex = 0; subIndex < toRemove.length; subIndex++) {
					const index = toRemove[subIndex];
					replacedStar = splice(replacedStar, index, 1, '.*');

					for (var i = subIndex + 1; i < toRemove.length; i++) {
						toRemove[i] += 1;
					}
				}

				if (replacedStar.indexOf('!') === -1) {
					regexes[eachParam].push(replacedStar);
				}

				// Replace negative in regexes
				var toRemove = [];
				var escaped = false;

				for (var i in replacedStar) {
					const eachChar = eachWord[i];

					if ((eachChar == '!') && (!escaped)) {
						toRemove.push(parseInt(i));
					}
					else if (eachChar == '\\') {
						escaped = true;
					}
				}

				var replacedExclamation = eachWord;

				for (var subIndex = 0; subIndex < toRemove.length; subIndex++) {
					const index = toRemove[subIndex];
					var rightIndexNegativeOption = replacedExclamation.indexOf(' ');
					if (rightIndexNegativeOption === -1) {
						rightIndexNegativeOption = replacedExclamation.length;
					}
					const negativeOption = replacedExclamation.slice(index + 1, rightIndexNegativeOption);
					negativeOptions.push(negativeOption);
					// const newRegex = '^(?!^' + negativeOption + '$).*$';
					// replacedExclamation = splice(replacedExclamation, index, rightIndexNegativeOption - index, newRegex);

					// for (var i = subIndex + 1; i < toRemove.length; i++) {
					// 	toRemove[i] += 1;
					// }
				}	

				// regexes[eachParam].push(replacedExclamation);
			}

			var basicRegex = null;
			console.log(regexes[eachParam]);
			if (regexes[eachParam].length == 0) {
				basicRegex = "(" + '.*' + ")";
			}
			else {
				basicRegex = "(" + regexes[eachParam].join('|') + ")";
			}
			var negativeRegex = '^(?!^' + negativeOptions.join('|') + '$)' + basicRegex + '$';
			console.log(negativeRegex);
			regexes[eachParam] = negativeRegex;

		}

		this.props.onFilterChange(regexes);
	}

	render() {
		const { multiValue, options } = this.state;
		return (
			<div className="section">
				<h3 className="section-heading">{this.props.label}</h3>
				<Select.Creatable
					multi={true}
					options={options}
					onChange={this.handleOnChange}
					value={multiValue}
				/>
			</div>
		);
	}
}

export default Search;

import React from 'react'
import Search from "@material-ui/icons/Search";
import {makeStyles,} from '@material-ui/core/styles'
import {InputAdornment, TextField,} from '@material-ui/core'

const useStyles = makeStyles((theme) => {
	console.log({theme})
	return ({
		root: {
			width: '100%',
			'& label.Mui-focused': {
				color: 'white',
			},
			'& .MuiOutlinedInput-root': {
				'& input': {
					padding: '14px 24px 14px 14px',
					'&::placeholder': {
						color: theme.palette.grey['500'],
					}
				},
				'& fieldset': {
					borderWidth: 2,
					borderRadius: 8,
					borderColor: theme.palette.grey['200'],
				},
				'&:hover fieldset': {
					borderWidth: 2,
					borderRadius: 8,
					borderColor: theme.palette.grey['300'],
				},
				'&.Mui-focused fieldset': {
					borderRadius: 8,
					borderColor: theme.palette.primary.main,
				},
				'& .MuiInputAdornment-positionStart svg': {
					color: theme.palette.grey['300'],
				}
			}
		},
		
		icon: {
			color: theme.palette.grey['200'],
		}
	});
})

const HeaderSearchBar = (props) => {
	const classes = useStyles();
	return <TextField
		autoComplete="off"
		variant="outlined"
		className={ classes.root }
		placeholder="Search in Spaces or Download Skylink"
		onChange={ props.onChange }
		InputProps={ {
			startAdornment: (
				<InputAdornment position="start" className={ classes.icon }>
					<Search/>
				</InputAdornment>
			),
		} }
	/>
}

export default HeaderSearchBar

HeaderSearchBar.propTypes = {}

HeaderSearchBar.defaultProps = {}

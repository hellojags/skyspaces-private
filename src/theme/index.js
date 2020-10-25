import {colors, createMuiTheme} from '@material-ui/core';

const theme = createMuiTheme({
	palette: {
		type: 'light',
		background: {
			default: '#f8f8f8',
			paper: '#f8f8f8'
		},
		primary: {
			light: colors.red[200],
			main: colors.green[500],
			dark: colors.blue[700],
		},
	},
	props: {
		drawer: {background: '#f8f8f8'},
		appBar: {
			background: '#ffffff',
			boxShadow: '0px 0px 31.04px 0.96px rgba(39, 35, 40, 0.08)'
		}
	},
});

export default theme;

import React from "react";
import skyAppLogo from "../../SkySpaces_g.png";
import FormControl from '@material-ui/core/FormControl';
import Snackbar from "@material-ui/core/Snackbar";
import Link from '@material-ui/core/Link';
import MuiAlert from "@material-ui/lab/Alert";
import Select from '@material-ui/core/Select';
import MenuItem from "@material-ui/core/MenuItem";
import {withStyles} from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import AppBar from "@material-ui/core/AppBar";
import clsx from "clsx";
import AppsOutlinedIcon from "@material-ui/icons/AppsOutlined";
import PropTypes from "prop-types";
import {withRouter} from "react-router";
import MenuIcon from "@material-ui/icons/Menu";
import {APP_BG_COLOR, DEFAULT_PORTAL} from "../../sn.constants";
import {NavLink} from "react-router-dom";
import {getAllPublicApps, launchSkyLink} from "../../sn.util";
import {parseSkylink} from "skynet-js";
import {getSkylink, getSkylinkIdxObject,} from "../../blockstack/blockstack-api";
import SnSignin from "./sn.signin";
import {connect} from "react-redux";
import {mapStateToProps, matchDispatcherToProps} from "./sn.topbar.container";
import {getPublicApps} from "../../skynet/sn.api.skynet";
import SnInfoModal from "../modals/sn.info.modal";
import HeaderSearchBar from "./sn.top-bar-search";

const drawerWidth = 240;
const useStyles = (theme) => {
	console.log(theme)
	return ({
		root: {
			display: "flex",
		},
		portalFormControl: {
			marginBottom: 10
		},
		appBar: {
			paddingTop: 10,
			paddingBottom: 10,
			zIndex: theme.zIndex.drawer + 1,
			boxShadow: theme.props.appBar.boxShadow,
			backgroundColor: theme.props.appBar.background,
		},
		drawer: {
			width: drawerWidth,
			flexShrink: 0,
		},
		menuButton: {
			marginRight: theme.spacing(2),
			[theme.breakpoints.up("sm")]: {
				display: "none",
			},
		},
		drawerPaper: {
			width: drawerWidth,
		},
		content: {
			flexGrow: 1,
			padding: theme.spacing(3),
		},
		toolbar: theme.mixins.toolbar,
		download: {
			width: 22,
			height: 22,
			cursor: 'pointer',
			objectFit: 'contain',
			marginLeft: 10
		}
	});
}

function Alert(props) {
	return <MuiAlert elevation={ 6 } variant="filled" { ...props } />;
}

class SnTopBar extends React.Component {
	static propTypes = {
		match: PropTypes.object.isRequired,
		location: PropTypes.object.isRequired,
		history: PropTypes.object.isRequired,
	};
	
	constructor(props) {
		super(props);
		this.state = {
			searchStr: "",
			invalidSkylink: false,
			publicPortal: DEFAULT_PORTAL,
			showInfoModal: false,
			infoModalContent: "",
			onInfoModalClose: () => this.setState({showInfoModal: false})
		};
	}
	
	getSkylinkIdxObject = (evt) => {
		evt.preventDefault();
		evt.stopPropagation();
		getSkylinkIdxObject(this.props.userSession).then((skyLinkIdxObject) => {
			getSkylink(this.props.userSession, skyLinkIdxObject.skhubIdList[1]);
		});
	};
	
	triggerSearch = async (evt) => {
		evt.preventDefault();
		evt.stopPropagation();
		if (this.props.snPublicHash != null) {
			if (this.state.searchStr == null || this.state.searchStr.trim() === "") {
				const allPublicApps = await getPublicApps(this.props.snPublicHash);
				this.props.setApps(getAllPublicApps(allPublicApps.data, this.props.snPublicInMemory.addedSkapps, this.props.snPublicInMemory.deletedSkapps));
				
			} else {
				this.props.setLoaderDisplay(true);
				const allPublicApps = await getPublicApps(this.props.snPublicHash);
				const filteredApps = getAllPublicApps(allPublicApps.data, this.props.snPublicInMemory.addedSkapps, this.props.snPublicInMemory.deletedSkapps)
					.filter((app) => {
						if (this.state.searchStr && this.state.searchStr.trim() !== "") {
							for (const skyAppKey in app) {
								if (
									app.hasOwnProperty(skyAppKey) &&
									skyAppKey !== "category" &&
									app[skyAppKey] != null &&
									app[skyAppKey]
										.toString()
										.toLowerCase()
										.indexOf(this.state.searchStr.toLowerCase()) > -1
								) {
									return app;
								}
							}
						} else {
							return app;
						}
						return "";
					});
				this.props.fetchAppsSuccess(filteredApps);
			}
		} else {
			this.props.history.push(
				"/skylinks?query=" + encodeURIComponent(this.state.searchStr)
			);
		}
	};
	onDownload = () => {
		try {
			let skylink = parseSkylink(this.state.searchStr)
			//alert("skylink" + skylink)
			launchSkyLink(skylink, this.props.snUserSetting);
		} catch (e) {
			this.setState({invalidSkylink: true})
		}
	};
	
	changePublicPortal = (portal) => {
		document.location.href = document.location.href.replace(
			document.location.origin,
			(new URL(portal)).origin
		);
	}
	
	handleLogoClick = (evt) => {
		this.props.snPublicHash && evt.preventDefault();
	}
	
	renderChangePortal = (value) => <FormControl className={ this.props.classes.portalFormControl }>
		<Select
			labelId="demo-simple-select-label"
			id="pulic-share-portal"
			value={ value }
			onChange={ (evt) => this.changePublicPortal(evt.target.value) }
		>
			<MenuItem className="d-none" value={ value }>
				Change Portal
			</MenuItem>
			{ document.location.origin.indexOf("localhost") > -1 && (
				<MenuItem value={ document.location.origin }>
					{ document.location.origin }
				</MenuItem>
			) }
			{ this.props.snPortalsList &&
			this.props.snPortalsList.portals.map((obj, index) => (
				<MenuItem key={ index } value={ obj.url }>
					{ obj.name }
				</MenuItem>
			)) }
		</Select>
	</FormControl>
	
	render() {
		const {classes} = this.props;
		const {snShowDesktopMenu, snTopbarDisplay} = this.props
		return (
			<>
				<AppBar position="fixed" className={ classes.appBar }>
					<div className={ clsx({"d-none": !snTopbarDisplay}) }>
						<div className='row mx-3'>
							<div className='d-flex align-items-center col-1 col-sm-1 col-md-3 px-0'>
								<div className='d-inline d-md-none px-0 mx-0'>
									<MenuIcon onClick={ this.props.toggleMobileMenuDisplay }/>
								</div>
								<div className='d-none d-md-inline'>
									<NavLink className="sm-up-logo" to="/" onClick={ this.handleLogoClick }>
										<img src={ skyAppLogo } alt="SkySpaces" className="cursor-pointer" height="35"/>
									</NavLink>
								</div>
							</div>
							{ (this.props.person != null || this.props.snPublicHash) && (
								<div className='col-11 col-sm-10 col-md-9 col-lg-6'>
									<div className='d-flex align-items-center'>
										<form onSubmit={ this.triggerSearch } className='d-flex flex-grow-1'>
											<HeaderSearchBar onChange={ (evt) => this.setState({searchStr: evt.target.value}) }/>
										</form>
										<Tooltip title="Download Skylink Content" arrow>
											<img alt={ 'download' } src={ "/icons/download.png" } className={ classes.download }
											     onClick={ this.onDownload }/>
										</Tooltip>
									</div>
								</div>
							) }
							<div className='d-none d-lg-flex justify-content-end align-items-center col-lg-3'>
								<Link justify="center" rel="noopener noreferrer" target="_blank"
								      href="https://blog.sia.tech/own-your-space-eae33a2dbbbc"
								      style={ {color: APP_BG_COLOR} }>Blog</Link>
								<Tooltip title="Launch SkyApps" arrow>
									<IconButton onClick={ () => window.open("https://skyapps.hns.siasky.net") }>
										<AppsOutlinedIcon style={ {color: APP_BG_COLOR} }/>
									</IconButton>
								</Tooltip>
								<div>
									{ this.props.snShowDesktopMenu && (<SnSignin/>) }
								</div>
							</div>
							{/*<Grid*/ }
							{/*	item*/ }
							{/*	xs={ (this.props.person != null || this.props.snPublicHash != null) ? 2 : 10 }*/ }
							{/*	className="hidden-sm-up">*/ }
							{/*	<div className="top-icon-container float-right">*/ }
							{/*		{ this.props.snShowDesktopMenu && (*/ }
							{/*			// TODO: need to create a reducer for signin component display*/ }
							{/*			<SnSignin/>*/ }
							{/*		) }*/ }
							{/*		{ this.renderChangePortal("") }*/ }
							{/*	</div>*/ }
							{/*</Grid>*/ }
						</div>
					</div>
				</AppBar>
				<Snackbar
					anchorOrigin={ {vertical: 'top', horizontal: 'center'} }
					open={ this.state.invalidSkylink }
					autoHideDuration={ 3000 }
					onClose={ () => this.setState({invalidSkylink: false}) }
					TransitionComponent={ "Fade" }
				>
					<Alert onClose={ () => this.setState({invalidSkylink: false}) } severity="error">
						Invalid Skylink ! Please enter valid 46 character skylink to Download.
					</Alert>
				</Snackbar>
				<SnInfoModal
					open={ this.state.showInfoModal }
					onClose={ this.state.onInfoModalClose }
					title="Public Share Link"
					type="public-share"
					content={ this.state.infoModalContent }
				/>
			</>
		);
	}
}

export default withRouter(
	withStyles(useStyles)(
		connect(mapStateToProps, matchDispatcherToProps)(SnTopBar)
	)
);

import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import { launchSkyLink } from "../../../sn.util";
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import SnAppCardActionBtnGrp from "../../cards/sn.app-card-action-btn-grp";
import { makeStyles } from "@material-ui/core/styles";
import { setLoaderDisplay } from "../../../reducers/actions/sn.loader.action";
import Card from "@material-ui/core/Card";
import Link from "@material-ui/core/Link";
import { fetchSkyspaceAppCount } from "../../../reducers/actions/sn.skyspace-app-count.action";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import cliTruncate from "cli-truncate";
import SnAddToSkyspaceModal from "../../modals/sn.add-to-skyspace.modal";
import { skylinkToUrl } from "../../../sn.util";
import { red } from "@material-ui/core/colors";
import { DOWNLOAD, APP_BG_COLOR, MUSIC_SVG_BASE64_DATA } from "../../../sn.constants";
import {
  bsGetSkyspaceNamesforSkhubId,
  bsAddSkylinkFromSkyspaceList,
  bsRemoveFromSkySpaceList,
  bsRemoveSkylinkFromSkyspaceList,
  bsAddToHistory
} from "../../../blockstack/blockstack-api";
import { useSelector, useDispatch } from "react-redux";

import { setAudioListAction, setChangedAudioStatusAction, updateCurrentAudioAction } from "../../../reducers/actions/sn.audio-player.action";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    "& > *": {
      margin: theme.spacing(0.5),
    },
    paddingBottom: 10,
  },
  media: {
    height: 0,
    // paddingTop: "56.25%", // 16:9
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  avatar: {
    backgroundColor: red[500],
  },
  cardHeader: {
    paddingTop: 5,
    paddingBottom: 5
  },
  largeButton: {
    padding: 24
  },
}));


export default function SnAudioDefault(props) {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [showAddToSkyspace, setShowAddToSkyspace] = useState(false);
  const [availableSkyspaces, setAvailableSkyspaces] = useState([]);
  const [currentApp, setCurrentApp] = useState();

  const stUserSession = useSelector((state) => state.userSession);
  const stSnSkyspaceList = useSelector((state) => state.snSkyspaceList);
  const currentAudio = useSelector((state) => state.SnAudioPlayer.currentAudio);

  const download = (app) => {
    dispatch(setLoaderDisplay(true));
    bsAddToHistory(stUserSession, {
      skylink: app.skylink,
      fileName: app.name,
      action: DOWNLOAD,
      contentLength: "",
      contentType: "",
      skhubId: app.skhubId,
      skyspaces: [],
      savedToSkySpaces: false,
    }).then(() => {
      dispatch(setLoaderDisplay(false));
      launchSkyLink(app.skylink, stUserSession);
    });
  };

  const handleSkyspaceAdd = (app) => {
    const skhubId = app.skhubId;
    bsGetSkyspaceNamesforSkhubId(stUserSession, skhubId)
      .then((skyspacesForApp) => {
        console.log("skyspacesForApp ", skyspacesForApp);
        if (skyspacesForApp == null) {
          skyspacesForApp = [];
        } else {
          skyspacesForApp = skyspacesForApp.skyspaceForSkhubIdList;
        }
        return stSnSkyspaceList.filter(
          (skyspace) => !skyspacesForApp.includes(skyspace)
        );
      })
      .then((availableSkyspaces) => {
        console.log("availableSkyspaces", availableSkyspaces);
        if (availableSkyspaces != null && availableSkyspaces.length > 0) {
          console.log("will show add to skyspace modal");
          setCurrentApp(app);
          setShowAddToSkyspace(true);
          setAvailableSkyspaces(availableSkyspaces);
        } else {
          console.log("NO new skyspace available");
        }
      });
  };

  const saveAddToSkyspaceChanges = (skyspaceList) => {
    const app = currentApp;
    if (skyspaceList != null && skyspaceList.lenghth !== 0) {
      dispatch(setLoaderDisplay(true));
      bsAddSkylinkFromSkyspaceList(
        stUserSession,
        app.skhubId,
        skyspaceList
      ).then(() => {
        dispatch(setLoaderDisplay(false));
        setShowAddToSkyspace(false);
        setCurrentApp();
        dispatch(fetchSkyspaceAppCount());
      });
    }
  };

  const removeFromSkyspace = (app) => {
    const skhubId = app.skhubId;
    dispatch(setLoaderDisplay(true));
    if (typeof props.skyspace != "undefined" && props.skyspace) {
      bsRemoveFromSkySpaceList(stUserSession, props.skyspace, skhubId).then(
        (res) => {
          dispatch(fetchSkyspaceAppCount());
          dispatch(setLoaderDisplay(false));
          props.onDelete();
        }
      );
    } else {
      bsRemoveSkylinkFromSkyspaceList(
        stUserSession,
        skhubId,
        app.skyspaceList
      ).then((res) => {
        dispatch(setLoaderDisplay(false));
        props.onDelete();
      });
    }
  };

  useEffect(() => {
    dispatch(setAudioListAction(props.filteredApps.map((app) => getOptions(app))));
  }, []);

  const getOptions = (app) => {
    const audioDataObject = {
      name: app.name,
      src: skylinkToUrl(app.skylink),
      id: app.skhubId,
      img: MUSIC_SVG_BASE64_DATA
    }
    return audioDataObject;
  };

  const onPlayButtonClicked = (id) => {
    const currentObjectClicked = props.filteredApps.filter(app => { return id === app.skhubId; });
    if (currentObjectClicked.length) {
      dispatch(updateCurrentAudioAction(getOptions(currentObjectClicked[0])));
      dispatch(setChangedAudioStatusAction(true));
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <Grid container spacing={1}>
          {props.filteredApps &&
            props.filteredApps
              .map((app, i) => {
                let isActive = (currentAudio && currentAudio.id === app.skhubId) ? true : false;
                return (
                  <React.Fragment key={i}>
                    <Grid item xs={12} key={i}>
                      <Card className={`${classes.root} ${isActive ? 'audio_card active' : 'audio_card'}`}>
                        <Box display="flex" p={1} width="100%">
                          <Box margin="auto">
                            <MusicNoteIcon style={{
                              color: APP_BG_COLOR,
                              width: '40px',
                              height: '40px',
                            }} />
                          </Box>
                          <Box flexGrow={1}>
                            <CardHeader
                              className={classes.cardHeader}
                              title={
                                <div>
                                  <div>
                                    <Link
                                      variant="inherit"
                                      className="font-weight-bold cursor-pointer h5"
                                      color="black"
                                      onClick={() => {
                                        download(app);
                                      }}
                                    >
                                      {cliTruncate(app.name, 25)}
                                    </Link>
                                    {props.isSelect && (
                                      <>
                                        {props.arrSelectedAps.indexOf(app) === -1 && (
                                          <RadioButtonUncheckedIcon className="selection-radio"
                                            onClick={() => props.onSelection(app)} />
                                        )}
                                        {props.arrSelectedAps.indexOf(app) > -1 && (
                                          <RadioButtonCheckedIcon className="selection-radio"
                                            onClick={() => props.onSelection(app, true)} />
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              }
                            />
                            <Grid item xs={12} sm={10}>
                              <CardActions disableSpacing
                                className="vertical-padding-0">
                                <SnAppCardActionBtnGrp
                                  app={app}
                                  // hideDelete={
                                  //   this.props.skyspace == null ||
                                  //   this.props.skyspace.trim() === ""
                                  // }
                                  source="img"
                                  hash={props.hash}
                                  hideTags={true}
                                  hideDelete={false}
                                  onAdd={() => handleSkyspaceAdd(app)}
                                  onEdit={() => props.openSkyApp(app)}
                                  onDelete={() => removeFromSkyspace(app)}
                                  onDownload={() => download(app)}
                                />
                              </CardActions>
                            </Grid>
                          </Box>
                          <Box margin="auto" >
                            <Tooltip title="Play" arrow>
                              <IconButton
                                onClick={() => { onPlayButtonClicked(app.skhubId) }}
                                style={{ color: APP_BG_COLOR }}>
                                <PlayArrowIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  </React.Fragment>
                );
              })}
        </Grid>
      </Grid>
      <SnAddToSkyspaceModal
        userSession={stUserSession}
        open={showAddToSkyspace}
        availableSkyspaces={availableSkyspaces}
        onClose={() => setShowAddToSkyspace(false)}
        onSave={saveAddToSkyspaceChanges}
      />
    </>
  );
}

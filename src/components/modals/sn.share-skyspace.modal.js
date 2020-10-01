import React, { useEffect, useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import MuiAlert from "@material-ui/lab/Alert";
import BlockIcon from "@material-ui/icons/Block";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DoneIcon from "@material-ui/icons/Done";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Button, makeStyles, Popover, Snackbar, Typography } from "@material-ui/core";
import { bsShareSkyspace } from "../../blockstack/blockstack-api";
import Slide from "@material-ui/core/Slide";
import { red } from "@material-ui/core/colors";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
    typography: {
        padding: theme.spacing(1)
    },
}));

export default function SnShareSkyspaceModal(props) {
    const classes = useStyles();
    const [recipientId, setRecipientId] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        setRecipientId("");
    }, [props.open]);

    const shareWithRecipient = async () => {
        try {
            await bsShareSkyspace(props.userSession, props.skyspaceName, recipientId);
        } catch (err) {
            console.log("share space error", err);
            setShowAlert(true);
        }
    }

    return (
        <>
            <Dialog
                open={props.open}
                onClose={props.onNo}
                TransitionComponent={Transition}
                keepMounted
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {props.content}
                    </DialogContentText>
                    <Grid container spacing={1} direction="row">
                        <Grid item xs={12}>
                            <>
                                <TextField
                                    id="recipientId"
                                    name="recipientId"
                                    label="Recipient Id"
                                    fullWidth
                                    value={recipientId}
                                    autoComplete="off"
                                    helperText="Please enter recipient blockstack ID."
                                    onChange={evt => {
                                        setAnchorEl(evt.target);
                                        setRecipientId(evt.target.value);
                                    }}
                                />
                                <Popover
                                    id={"id"}
                                    open={showAlert}
                                    anchorEl={anchorEl}
                                    onClose={() => setShowAlert(false)}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'center',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'center',
                                    }}
                                >
                                    <Typography className={classes.typography}>The user has not created an account with Skyspaces!</Typography>
                                </Popover>
                            </>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={props.onNo}
                        autoFocus
                        variant="contained"
                        color="secondary"
                        className="btn-bg-color"
                        startIcon={<BlockIcon />}
                    >
                        Cancel
            </Button>
                    <Button
                        onClick={evt => shareWithRecipient()}
                        autoFocus
                        disabled={recipientId == null || recipientId.trim() === ""}
                        variant="contained"
                        color="primary"
                        className="btn-bg-color"
                        startIcon={<DoneIcon />}
                    >
                        OK
            </Button>
                </DialogActions>
            </Dialog>
            {/* <Snackbar
        open={showAlert}
        autoHideDuration={40000}
        onClose={() => setShowAlert(false)}
        style={{ zIndex: 999999}}
      >
        <Alert onClose={() => setShowAlert(false)} severity={"error"}>
          The user has not created an account with Skyspaces!
        </Alert>
      </Snackbar> */}
        </>
    );
}

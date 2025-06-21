import styles from "./ErrorModal.module.scss";
import ReactDOM from "react-dom";

const Backdrop = (props) => {
  return <div className={styles.backdrop} onClick={props.onClick} />;
};

function Confirmation(props) {
  return (
    <div className={styles.modal}>
      <h2>ERROR</h2>
      {props.text}
      <div className={styles.close} onClick={props.onClick}>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}

function ErrorModal(props) {
  return (
    <>
      {ReactDOM.createPortal(
        <Backdrop onClick={props.onClick} />,
        document.getElementById("backdrop-root")
      )}
      {ReactDOM.createPortal(
        <Confirmation onClick={props.onClick} text={props.children} />,
        document.getElementById("modal-root")
      )}
    </>
  );
}

export default ErrorModal;

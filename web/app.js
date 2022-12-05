var winObj;

function jsTestFunction(msg){

    //dialogconfirm();

    if (window.confirm("TrackBall Checkを終了します。")){
        open('about:blank', '_self').close();    //一度再表示してからClose 
    };
    
}

function dialogconfirm(){
    dialog({
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
            "Do it": function () {
                $(this).dialog("close");
            },
            Cancel: function () {
                $(this).dialog("close");
            }
        }
    });
}


function openWin() {
    winObj = window.open(
        "https://www.yahoo.co.jp/",
        "_blank",
        "width=300,height=200"
    );
}

function closeWin() {
    if ((winObj) && (!winObj.closed)) {
        winObj.close();
    }
    else {
        alert('サブウインドウは開かれていません');
    }
    winObj = null;
}


// 自windowを閉じる
function winClose() {
    open('about:blank', '_self').close();    //一度再表示してからClose

}


window.state = {
    hello: 'world'
}

window.logger = (flutter_value) => {
    console.log({ js_context: this, flutter_value });
}

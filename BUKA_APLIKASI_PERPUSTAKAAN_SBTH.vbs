' ==============================================================================
' LAUNCHER RESMI PERPUSTAKAAN DIGITAL SBTH TK (MODE SILENT TANPA JENDELA HITAM)
' Membuka aplikasi langsung ke browser web tanpa menampilkan konsol hitam (CMD)
' ==============================================================================

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Dapatkan folder lokasi aplikasi
scriptPath = WScript.ScriptFullName
appDir = fso.GetParentFolderName(scriptPath)
WshShell.CurrentDirectory = appDir

' 1. Cek apakah server Next.js pada port 3000 sudah berjalan
Dim checkCmd, execObj, isRunning
checkCmd = "cmd /c netstat -ano | findstr /R "":3000.*LISTENING"""
Set execObj = WshShell.Exec(checkCmd)
isRunning = False

Do While Not execObj.StdOut.AtEndOfStream
    line = execObj.StdOut.ReadLine()
    If InStr(line, ":3000") > 0 And InStr(line, "LISTENING") > 0 Then
        isRunning = True
        Exit Do
    End If
Loop

If isRunning Then
    ' Jika sudah berjalan, langsung buka browser tanpa perlu jalankan ulang server
    WshShell.Run "cmd /c start http://localhost:3000", 0, False
Else
    ' Jalankan server Next.js secara SILENT (windowStyle = 0, sepenuhnya di latar belakang)
    WshShell.Run "cmd /c npm run dev", 0, False
    
    ' Beri jeda 3.5 detik untuk inisialisasi server Next.js
    WScript.Sleep 3500
    
    ' Buka aplikasi web langsung di browser bawaan pengguna
    WshShell.Run "cmd /c start http://localhost:3000", 0, False
End If

Set WshShell = Nothing
Set fso = Nothing

import EmailType from '@common/constants/emailType'
import EmailContentParam from '../interfaces/emailContentParam'

export default (emailType: EmailType, param: Partial<EmailContentParam>) => {
    const {
        // EmailType.Auth
        email,
        key,

        // EmailType.PasswordReset
        name,
        password,

        // EmailType.TeamCompleted
        boardAuthor,

        // EmailType.Ask
        kind,
        title,
        content, // +) EmailType.TeamCompleted
    } = param


    const emailContent = {
        [EmailType.Auth]: `
                Geteam 계정에 등록하신 이메일 주소(${email})가 올바른지 확인하기 위한 이메일입니다.<br>
                아래의 버튼을 클릭하여 이메일 인증을 완료해주세요!<br>
                개인정보 보호를 위해 인증 링크는 하루동안만 유효합니다.<br>
                만약 인증 메일의 재발송을 원하신다면 <a href="http://127.0.0.1:3003/signup/verify/new/${key}?email=${email}" style="color: #efdc05;">이 링크</a>를 클릭해주세요!
        `,
        [EmailType.PasswordReset]: `
            ${name}님의 임시 비밀번호는 <span style="background: #efdc05;">${password}</span> 입니다.
        `,
        [EmailType.TeamCompleted]: `
            <h5>팀을 모집한 ${boardAuthor} 님이 보내셨습니다<h5><br>${content!.replace(/(?:\r\n|\r|\n)/g, '<br />')}
        `,
        [EmailType.Ask]: `
            <h3>[${kind}] ${title}</h3> ${content!.replace(/(?:\r\n|\r|\n)/g, '<br />')}
        `,
    }

    return emailContent[emailType]
}
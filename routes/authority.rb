class AuthorityController < Application

  get '/authority' do
    flash_debug "GET authority"
    slim :'authority'
  end

end
